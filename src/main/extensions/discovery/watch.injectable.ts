/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { constants } from "fs";
import path from "path";
import type { Access } from "../../../common/fs/access.injectable";
import accessInjectable from "../../../common/fs/access.injectable";
import type { CopyDir } from "../../../common/fs/copy-dir.injectable";
import copyDirInjectable from "../../../common/fs/copy-dir.injectable";
import type { EnsureDir } from "../../../common/fs/ensure-dir.injectable";
import ensureDirInjectable from "../../../common/fs/ensure-dir.injectable";
import type { Remove } from "../../../common/fs/remove.injectable";
import removeInjectable from "../../../common/fs/remove.injectable";
import type { LensLogger } from "../../../common/logger";
import localExtensionsDirectoryInjectable from "../../../common/paths/local-extensions.injectable";
import extensionsNodeModulesDirectoryInjectable from "../../../common/paths/node-modules.injectable";
import extensionsDiscoveryLoggerInjectable from "./logger.injectable";
import type { InstalledExtensions } from "../../../common/extensions/installed.injectable";
import installedExtensionsInjectable from "../../../common/extensions/installed.injectable";
import type { EnsureExtensions } from "./ensure-extensions.injectable";
import ensureExtensionsInjectable from "./ensure-extensions.injectable";
import directoryForUserDataInjectable from "../../../common/paths/user-data.injectable";
import type { OnWatchAdd } from "./watch-handlers/on-add.injectable";
import type { OnWatchUnlink } from "./watch-handlers/on-unlink.injectable";
import onWatchAddInjectable from "./watch-handlers/on-add.injectable";
import onWatchUnlinkInjectable from "./watch-handlers/on-unlink.injectable";
import type { CreateWatcher } from "../../../common/fs/create-watcher.injectable";
import createWatcherInjectable from "../../../common/fs/create-watcher.injectable";
import resourcesPathInjectable from "../../../common/vars/resources-path.injectable";

export type WatchExtensions = () => Promise<void>;

interface Dependencies {
  installedExtensions: InstalledExtensions;
  logger: LensLogger;
  directoryForUserData: string;
  extensionsNodeModulesDirectory: string;
  localExtensionsDirectory: string;
  remove: Remove;
  access: Access;
  ensureDir: EnsureDir;
  copyDir: CopyDir;
  ensureExtensions: EnsureExtensions;
  onWatchAdd: OnWatchAdd;
  onWatchUnlink: OnWatchUnlink;
  createWatcher: CreateWatcher;
  resourcesPath: string;
}

function watchExtensions( {
  installedExtensions,
  logger,
  directoryForUserData,
  extensionsNodeModulesDirectory,
  localExtensionsDirectory,
  remove,
  access,
  ensureDir,
  copyDir,
  ensureExtensions,
  onWatchAdd,
  onWatchUnlink,
  createWatcher,
  resourcesPath,
}: Dependencies): WatchExtensions {
  let hasBeenCalled = false;
  const inTreeTargetPath = path.join(directoryForUserData, "extensions");
  const inTreeFolderPath = path.resolve(resourcesPath, "extensions");

  return async () => {
    if (hasBeenCalled) {
      throw new Error("watchExtensions may only be called once");
    }

    hasBeenCalled = true;
    let bundledFolderPath: string;

    logger.info(`loading extensions from ${directoryForUserData}`);

    // fs.remove won't throw if path is missing
    await remove(path.join(directoryForUserData, "package-lock.json"));

    try {
      // Verify write access to static/extensions, which is needed for symlinking
      await access(inTreeFolderPath, constants.W_OK);

      // Set bundled folder path to static/extensions
      bundledFolderPath = inTreeFolderPath;
    } catch {
      // If there is error accessing static/extensions, we need to copy in-tree extensions so that we can symlink them properly on "npm install".
      // The error can happen if there is read-only rights to static/extensions, which would fail symlinking.

      // Remove e.g. /Users/<username>/Library/Application Support/LensDev/extensions
      await remove(inTreeTargetPath);

      // Create folder e.g. /Users/<username>/Library/Application Support/LensDev/extensions
      await ensureDir(inTreeTargetPath);

      // Copy static/extensions to e.g. /Users/<username>/Library/Application Support/LensDev/extensions
      await copyDir(inTreeFolderPath, inTreeTargetPath);

      // Set bundled folder path to e.g. /Users/<username>/Library/Application Support/LensDev/extensions
      bundledFolderPath = inTreeTargetPath;
    }

    await ensureDir(extensionsNodeModulesDirectory);
    await ensureDir(localExtensionsDirectory);

    /**
     * NOTE: this MUST be a replace so that all bundled extensions are added at once.
     *
     * REF: EXTENSIONS-DISCOVERY-BUNDLED
     */
    installedExtensions.replace(await ensureExtensions(bundledFolderPath));

    logger.info(`watching extension add/remove in ${localExtensionsDirectory}`);

    createWatcher({
      // For adding and removing symlinks to work, the depth has to be 1.
      depth: 1,
      ignoreInitial: true,
      // Try to wait until the file has been completely copied.
      // The OS might emit an event for added file even it's not completely written to the file-system.
      awaitWriteFinish: {
        // Wait 300ms until the file size doesn't change to consider the file written.
        // For a small file like package.json this should be plenty of time.
        stabilityThreshold: 300,
      },
    })
      // Extension add is detected by watching "<extensionDir>/package.json" add
      .on("add", onWatchAdd)
      // Extension remove is detected by watching "<extensionDir>" unlink
      .on("unlinkDir", onWatchUnlink)
      // Extension remove is detected by watching "<extensionSymLink>" unlink
      .on("unlink", onWatchUnlink)
      .add(localExtensionsDirectory);
  };
}

const watchExtensionsInjectable = getInjectable({
  instantiate: (di) => watchExtensions({
    logger: di.inject(extensionsDiscoveryLoggerInjectable),
    installedExtensions: di.inject(installedExtensionsInjectable),
    access: di.inject(accessInjectable),
    copyDir: di.inject(copyDirInjectable),
    ensureDir: di.inject(ensureDirInjectable),
    remove: di.inject(removeInjectable),
    directoryForUserData: di.inject(directoryForUserDataInjectable),
    extensionsNodeModulesDirectory: di.inject(extensionsNodeModulesDirectoryInjectable),
    localExtensionsDirectory: di.inject(localExtensionsDirectoryInjectable),
    ensureExtensions: di.inject(ensureExtensionsInjectable),
    onWatchAdd: di.inject(onWatchAddInjectable),
    onWatchUnlink: di.inject(onWatchUnlinkInjectable),
    createWatcher: di.inject(createWatcherInjectable),
    resourcesPath: di.inject(resourcesPathInjectable),
  }),
  id: "watch-extensions",
});

export default watchExtensionsInjectable;
