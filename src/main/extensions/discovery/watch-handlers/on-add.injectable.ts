/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import { getInjectable } from "@ogre-tools/injectable";
import localExtensionsDirectoryInjectable from "../../../../common/paths/local-extensions.injectable";
import type { LensLogger } from "../../../../common/logger";
import extensionsDiscoveryLoggerInjectable from "../logger.injectable";
import manifestFilenameInjectable from "../../../../common/vars/manifest-filename.injectable";
import type { SetExtensionInstalling } from "../../../../common/ipc/extensions/set-installing.token";
import type { LoadExtensionFromFolder } from "../load-extension-from-folder.injectable";
import type { Remove } from "../../../../common/fs/remove.injectable";
import type { InstallDependency } from "../../deps-installer/install-dependency.injectable";
import type { ClearExtensionInstalling } from "../../../../common/ipc/extensions/clear-installing.token";
import type { InstalledExtensions } from "../../../../common/extensions/installed.injectable";
import installedExtensionsInjectable from "../../../../common/extensions/installed.injectable";
import setExtensionInstallingInjectable from "../../../ipc/extensions/set-installing.injectable";
import clearExtensionInstallingInjectable from "../../../ipc/extensions/clear-installing.injectable";
import installDependencyInjectable from "../../deps-installer/install-dependency.injectable";
import loadExtensionFromFolderInjectable from "../load-extension-from-folder.injectable";
import removeInjectable from "../../../../common/fs/remove.injectable";

export type OnWatchAdd = (filePath: string) => void;

interface Dependencies {
  localExtensionsDirectory: string;
  installedExtensions: InstalledExtensions;
  logger: LensLogger;
  manifestFilename: string;
  setExtensionInstalling: SetExtensionInstalling;
  clearExtensionInstalling: ClearExtensionInstalling;
  loadExtensionFromFolder: LoadExtensionFromFolder;
  remove: Remove;
  installDependency: InstallDependency;
}

const onAdd = ({
  localExtensionsDirectory,
  logger,
  manifestFilename,
  installedExtensions,
  setExtensionInstalling,
  clearExtensionInstalling,
  loadExtensionFromFolder,
  remove,
  installDependency,
}: Dependencies): OnWatchAdd => (
  async (manifestPath: string): Promise<void> => {
    // e.g. "foo/package.json"
    const relativePath = path.relative(localExtensionsDirectory, manifestPath);

    // Converts "foo/package.json" to ["foo", "package.json"], where length of 2 implies
    // that the added file is in a folder under local folder path.
    // This safeguards against a file watch being triggered under a sub-directory which is not an extension.
    const isUnderLocalFolderPath = relativePath.split(path.sep).length === 2;

    if (path.basename(manifestPath) === manifestFilename && isUnderLocalFolderPath) {
      try {
        setExtensionInstalling(manifestPath);
        const absPath = path.dirname(manifestPath);

        // this.loadExtensionFromPath updates this.packagesJson
        const extension = await loadExtensionFromFolder(absPath, { isBundled: false });

        if (extension) {
          // Remove a broken symlink left by a previous installation if it exists.
          await remove(extension.manifestPath);

          // Install dependencies for the new extension
          await installDependency(extension.absolutePath);

          installedExtensions.set(extension.id, extension);
          logger.info(`Added extension ${extension.manifest.name}`);
        }
      } catch (error) {
        logger.error(`failed to add extension: ${error}`, { error });
      } finally {
        clearExtensionInstalling(manifestPath);
      }
    }
  }
);

const onWatchAddInjectable = getInjectable({
  instantiate: (di) => onAdd({
    localExtensionsDirectory: di.inject(localExtensionsDirectoryInjectable),
    logger: di.inject(extensionsDiscoveryLoggerInjectable),
    manifestFilename: di.inject(manifestFilenameInjectable),
    installedExtensions: di.inject(installedExtensionsInjectable),
    setExtensionInstalling: di.inject(setExtensionInstallingInjectable),
    clearExtensionInstalling: di.inject(clearExtensionInstallingInjectable),
    installDependency: di.inject(installDependencyInjectable),
    loadExtensionFromFolder: di.inject(loadExtensionFromFolderInjectable),
    remove: di.inject(removeInjectable),
  }),
  id: "on-watch-add",
});

export default onWatchAddInjectable;
