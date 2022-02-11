/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { inspect } from "util";
import type { LensLogger } from "../../../../common/logger";
import { disposer, Disposer, getOrInsertWith, iter, waitForPath } from "../../../../common/utils";
import type { EntitySource } from "../../entity/registry";
import type { DiffChangedConfig } from "./diff-changed-config.injectable";
import diffChangedConfigInjectable from "./diff-changed-config.injectable";
import kubeconfigSyncManagerLoggerInjectable from "./logger.injectable";
import path from "path";
import globToRegExp from "glob-to-regexp";
import { computed, observable, ObservableMap } from "mobx";
import type { RootSourceValue } from "./compute-diff.injectable";
import type { Stat } from "../../../../common/fs/stat.injectable";
import statInjectable from "../../../../common/fs/stat.injectable";
import type { CreateWatcher } from "../../../../common/fs/create-watcher.injectable";
import createWatcherInjectable from "../../../../common/fs/create-watcher.injectable";

/**
 * This is the list of globs of which files are ignored when under a folder sync
 */
const ignoreGlobs = [
  "*.lock", // kubectl lock files
  "*.swp", // vim swap files
  ".DS_Store", // macOS specific
].map(rawGlob => ({
  rawGlob,
  matcher: globToRegExp(rawGlob),
}));

/**
 * This should be much larger than any kubeconfig text file
 *
 * Even if you have a cert-file, key-file, and client-cert files that is only
 * 12kb of extra data (at 4096 bytes each) which allows for around 150 entries.
 */
const folderSyncMaxAllowedFileReadSize = 2 * 1024 * 1024; // 2 MiB
const fileSyncMaxAllowedFileReadSize = 16 * folderSyncMaxAllowedFileReadSize; // 32 MiB

export type WatchFileChanges = (filePath: string) => [EntitySource, Disposer];

interface Dependencies {
  logger: LensLogger;
  diffChangedConfig: DiffChangedConfig;
  stat: Stat;
  createWatcher: CreateWatcher;
}

const watchFileChanges = ({ logger, diffChangedConfig, stat, createWatcher }: Dependencies): WatchFileChanges => (
  (filePath) => {
    const rootSource = new ObservableMap<string, ObservableMap<string, RootSourceValue>>();
    const derivedSource = computed(() => Array.from(iter.flatMap(rootSource.values(), from => iter.map(from.values(), child => child[1]))));
    const stop = disposer();

    (async () => {
      try {
        await waitForPath(filePath);

        const stats = await stat(filePath);
        const isFolderSync = stats.isDirectory();
        const cleanupFns = new Map<string, Disposer>();
        const maxAllowedFileReadSize = isFolderSync
          ? folderSyncMaxAllowedFileReadSize
          : fileSyncMaxAllowedFileReadSize;
        const watcher = createWatcher({
          followSymlinks: true,
          depth: isFolderSync ? 0 : 1, // DIRs works with 0 but files need 1 (bug: https://github.com/paulmillr/chokidar/issues/1095)
          disableGlobbing: true,
          ignorePermissionErrors: true,
          usePolling: false,
          awaitWriteFinish: {
            pollInterval: 100,
            stabilityThreshold: 1000,
          },
          atomic: 150, // for "atomic writes"
        });

        stop.push(() => watcher.close());

        watcher
          .on("change", (childFilePath, stats) => {
            const cleanup = cleanupFns.get(childFilePath);

            if (!cleanup) {
            // file was previously ignored, do nothing
              return void logger.debug(`${inspect(childFilePath)} that should have been previously ignored has changed. Doing nothing`);
            }

            cleanup();
            cleanupFns.set(childFilePath, diffChangedConfig({
              filePath: childFilePath,
              source: getOrInsertWith(rootSource, childFilePath, observable.map),
              stats,
              maxAllowedFileReadSize,
            }));
          })
          .on("add", (childFilePath, stats) => {
            if (isFolderSync) {
              const fileName = path.basename(childFilePath);

              for (const ignoreGlob of ignoreGlobs) {
                if (ignoreGlob.matcher.test(fileName)) {
                  return void logger.info(`ignoring ${inspect(childFilePath)} due to ignore glob: ${ignoreGlob.rawGlob}`);
                }
              }
            }

            cleanupFns.set(childFilePath, diffChangedConfig({
              filePath: childFilePath,
              source: getOrInsertWith(rootSource, childFilePath, observable.map),
              stats,
              maxAllowedFileReadSize,
            }));
          })
          .on("unlink", (childFilePath) => {
            cleanupFns.get(childFilePath)?.();
            cleanupFns.delete(childFilePath);
            rootSource.delete(childFilePath);
          })
          .on("error", error => logger.error(`watching file/folder failed: ${error}`, { filePath }))
          .add(filePath);
      } catch (error) {
        console.log(error.stack);
        logger.warn(`failed to start watching changes: ${error}`);
      }
    })();

    return [derivedSource, stop];
  }
);

const watchFileChangesInjectable = getInjectable({
  instantiate: (di) => watchFileChanges({
    logger: di.inject(kubeconfigSyncManagerLoggerInjectable),
    diffChangedConfig: di.inject(diffChangedConfigInjectable),
    stat: di.inject(statInjectable),
    createWatcher: di.inject(createWatcherInjectable),
  }),
  id: "watch-file-changes",
});

export default watchFileChangesInjectable;
