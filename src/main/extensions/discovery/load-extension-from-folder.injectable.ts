/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import type { IsExtensionEnabled } from "../../../common/extensions/preferences/is-enabled.injectable";
import isExtensionEnabledInjectable from "../../../common/extensions/preferences/is-enabled.injectable";
import type { PathExists } from "../../../common/fs/path-exists.injectable";
import pathExistsInjectable from "../../../common/fs/path-exists.injectable";
import type { ReadJsonFile } from "../../../common/fs/read-json-file.injectable";
import readJsonFileInjectable from "../../../common/fs/read-json-file.injectable";
import type { LensLogger } from "../../../common/logger";
import isProductionInjectable from "../../../common/vars/is-production.injectable";
import manifestFilenameInjectable from "../../../common/vars/manifest-filename.injectable";
import extensionsDiscoveryLoggerInjectable from "./logger.injectable";
import type { GetInstallPath } from "./get-install-path.injectable";
import getInstallPathInjectable from "./get-install-path.injectable";
import type { IsCompatibleBundledExtension } from "./is-compatible-bundled-extension.injectable";
import isCompatibleBundledExtensionInjectable from "./is-compatible-bundled-extension.injectable";
import type { IsCompatibleExtension } from "./is-compatible-extension.injectable";
import isCompatibleExtensionInjectable from "./is-compatible-extension.injectable";
import type { ValidateManifestFile } from "./validate-manifest-file.injectable";
import validateManifestFileInjectable from "./validate-manifest-file.injectable";
import type { InstalledExtension } from "../../../common/extensions/installed.injectable";

export interface LoadFromFolderOptions {
  isBundled: boolean;
}
export type LoadExtensionFromFolder = (folderPath: string, opts: LoadFromFolderOptions) => Promise<InstalledExtension | null>;

interface Dependencies {
  logger: LensLogger;
  manifestFilename: string;
  readJsonFile: ReadJsonFile;
  validateManifestFile: ValidateManifestFile;
  pathExists: PathExists;
  isProduction: boolean;
  isCompatibleBundledExtension: IsCompatibleBundledExtension;
  isCompatibleExtension: IsCompatibleExtension;
  isExtensionEnabled: IsExtensionEnabled;
  getInstallPath: GetInstallPath;
}

const loadExtensionFromFolder = ({
  logger,
  manifestFilename,
  readJsonFile,
  validateManifestFile,
  pathExists,
  isCompatibleBundledExtension,
  isCompatibleExtension,
  isProduction,
  isExtensionEnabled,
  getInstallPath,
}: Dependencies): LoadExtensionFromFolder => (
  async (folderPath, { isBundled }) => {
    const manifestPath = path.resolve(folderPath, manifestFilename);

    try {
      const manifest = validateManifestFile(await readJsonFile(manifestPath));
      const id = path.join(getInstallPath(manifest.name), manifestFilename);
      const isEnabled = isExtensionEnabled({ id, isBundled });
      const extensionDir = path.dirname(manifestPath);
      const npmPackage = path.join(extensionDir, `${manifest.name}-${manifest.version}.tgz`);
      const absolutePath = (isProduction && await pathExists(npmPackage)) ? npmPackage : extensionDir;
      const isCompatible = (isBundled && isCompatibleBundledExtension(manifest)) || isCompatibleExtension(manifest);

      return {
        id,
        absolutePath,
        manifestPath: id,
        manifest,
        isBundled,
        isEnabled,
        isCompatible,
      };
    } catch (error) {
      if (error.code === "ENOTDIR") {
        // ignore this error, probably from .DS_Store file
        logger.debug(`could not load extension manifest through a not-dir-like FS entry at ${manifestPath}`);
      } else {
        logger.error(`can't load extension manifest at ${manifestPath}`, error);
      }

      return null;
    }
  }
);

const loadExtensionFromFolderInjectable = getInjectable({
  instantiate: (di) => loadExtensionFromFolder({
    logger: di.inject(extensionsDiscoveryLoggerInjectable),
    manifestFilename: di.inject(manifestFilenameInjectable),
    isProduction: di.inject(isProductionInjectable),
    getInstallPath: di.inject(getInstallPathInjectable),
    isCompatibleExtension: di.inject(isCompatibleExtensionInjectable),
    pathExists: di.inject(pathExistsInjectable),
    readJsonFile: di.inject(readJsonFileInjectable),
    validateManifestFile: di.inject(validateManifestFileInjectable),
    isCompatibleBundledExtension: di.inject(isCompatibleBundledExtensionInjectable),
    isExtensionEnabled: di.inject(isExtensionEnabledInjectable),
  }),
  id: "load-extension-from-folder",
});

export default loadExtensionFromFolderInjectable;
