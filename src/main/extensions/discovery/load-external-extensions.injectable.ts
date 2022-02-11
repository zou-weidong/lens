/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Dirent } from "fs";
import path from "path";
import type { ReadDir } from "../../../common/fs/read-dir.injectable";
import readDirInjectable from "../../../common/fs/read-dir.injectable";
import type { LensLogger } from "../../../common/logger";
import localExtensionsDirectoryInjectable from "../../../common/paths/local-extensions.injectable";
import extensionsDiscoveryLoggerInjectable from "./logger.injectable";
import type { LoadExtensionFromFolder } from "./load-extension-from-folder.injectable";
import loadExtensionFromFolderInjectable from "./load-extension-from-folder.injectable";
import type { InstalledExtension } from "../../../common/extensions/installed.injectable";

export type LoadExternalExtensions = (bundledExtensionNames: Set<string>) => Promise<InstalledExtension[]>;

interface Dependencies {
  logger: LensLogger;
  localExtensionsDirectory: string;
  loadExtensionFromFolder: LoadExtensionFromFolder;
  readDir: ReadDir;
}

const loadExternalExtensions = ({
  logger,
  localExtensionsDirectory,
  loadExtensionFromFolder,
  readDir,
}: Dependencies): LoadExternalExtensions => (
  async (bundledExtensionNames) => {
    const loadExternalExtension = (dirEntry: Dirent): Promise<InstalledExtension | null> => {
      if (bundledExtensionNames.has(dirEntry.name)) {
        return null;
      }

      if (dirEntry.isDirectory() || dirEntry.isSymbolicLink()) {
        const folderPath = path.resolve(localExtensionsDirectory, dirEntry.name);

        return loadExtensionFromFolder(folderPath, { isBundled: false });
      }

      return null;
    };
    const entries = await readDir(localExtensionsDirectory, { withFileTypes: true });
    const rawExtensions = await Promise.all(entries.map(loadExternalExtension));
    const extensions = rawExtensions.filter(Boolean);

    logger.debug(`${extensions.length} extensions loaded`, { folderPath: localExtensionsDirectory, extensions });

    return extensions;
  }
);

const loadExternalExtensionsInjectable = getInjectable({
  instantiate: (di) => loadExternalExtensions({
    logger: di.inject(extensionsDiscoveryLoggerInjectable),
    loadExtensionFromFolder: di.inject(loadExtensionFromFolderInjectable),
    localExtensionsDirectory: di.inject(localExtensionsDirectoryInjectable),
    readDir: di.inject(readDirInjectable),
  }),
  id: "load-external-extensions",
});

export default loadExternalExtensionsInjectable;
