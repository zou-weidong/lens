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
import extensionsDiscoveryLoggerInjectable from "./logger.injectable";
import type { LoadExtensionFromFolder } from "./load-extension-from-folder.injectable";
import loadExtensionFromFolderInjectable from "./load-extension-from-folder.injectable";
import type { InstalledExtension } from "../../../common/extensions/installed.injectable";

export type LoadBundledExtensions = (bundledFolderPath: string) => Promise<InstalledExtension[]>;

interface Dependencies {
  logger: LensLogger;
  readDir: ReadDir;
  loadExtensionFromFolder: LoadExtensionFromFolder;
}

const loadBundledExtensions = ({
  logger,
  readDir,
  loadExtensionFromFolder,
}: Dependencies): LoadBundledExtensions => (
  async (bundledFolderPath) => {
    const loadBundledExtension = (dirEntry: Dirent): Promise<InstalledExtension | null> => {
      if (dirEntry.isDirectory()) {
        const folderPath = path.resolve(bundledFolderPath, dirEntry.name);

        return loadExtensionFromFolder(folderPath, { isBundled: true });
      }

      return null;
    };

    const entries = await readDir(bundledFolderPath, { withFileTypes: true });
    const rawExtensions = await Promise.all(entries.map(loadBundledExtension));
    const extensions = rawExtensions.filter(Boolean);

    logger.debug(` ${extensions.length} extensions loaded`, { folderPath: bundledFolderPath, extensions });

    return extensions;
  }
);

const loadBundledExtensionsInjectable = getInjectable({
  instantiate: (di) => loadBundledExtensions({
    logger: di.inject(extensionsDiscoveryLoggerInjectable),
    readDir: di.inject(readDirInjectable),
    loadExtensionFromFolder: di.inject(loadExtensionFromFolderInjectable),
  }),
  id: "load-bundled-extensions",
});

export default loadBundledExtensionsInjectable;
