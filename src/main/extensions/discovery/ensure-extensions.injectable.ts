/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { LensLogger } from "../../../common/logger";
import type { LoadBundledExtensions } from "./load-bundled-extensions.injectable";
import extensionsDiscoveryLoggerInjectable from "./logger.injectable";
import loadBundledExtensionsInjectable from "./load-bundled-extensions.injectable";
import type { InstallDependencies } from "../deps-installer/install-dependencies.injectable";
import installDependenciesInjectable from "../deps-installer/install-dependencies.injectable";
import lensPackageJsonPathInjectable from "../../../common/paths/package-json.injectable";
import type { InstallDependency } from "../deps-installer/install-dependency.injectable";
import installDependencyInjectable from "../deps-installer/install-dependency.injectable";
import loadExternalExtensionsInjectable, { LoadExternalExtensions } from "./load-external-extensions.injectable";
import type { InstalledExtension } from "../../../common/extensions/installed.injectable";
import type { LensExtensionId } from "../../../common/extensions/manifest";

export type EnsureExtensions = (bundledFolderPath: string) => Promise<[LensExtensionId, InstalledExtension][]>;

interface Dependencies {
  logger: LensLogger;
  loadBundledExtensions: LoadBundledExtensions;
  installDependencies: InstallDependencies;
  installDependency: InstallDependency;
  loadExternalExtensions: LoadExternalExtensions;
  lensPackageJsonPath: string;
}

const ensureExtensions = ({
  logger,
  loadBundledExtensions,
  installDependencies,
  installDependency,
  lensPackageJsonPath,
  loadExternalExtensions,
}: Dependencies): EnsureExtensions => (
  async (bundledFolderPath) => {
    const bundledExtensions = await loadBundledExtensions(bundledFolderPath);
    const bundledDependencies = Object.fromEntries(
      bundledExtensions.map(extension => [extension.manifest.name, extension.absolutePath]),
    );
    const bundledExtensionNames = new Set(bundledExtensions.map((extension) => extension.manifest.name));

    await installDependencies(lensPackageJsonPath, bundledDependencies);

    const userExtensions = await loadExternalExtensions(bundledExtensionNames);

    for (const extension of userExtensions) {
      try {
        await installDependency(extension.absolutePath);
      } catch (error) {
        if (error.code === "ENOENT") {
          // ignore not found
          continue;
        }

        const message = error.message || error || "unknown error";
        const { name, version } = extension.manifest;

        logger.error(`failed to install user extension ${name}@${version}`, message);
      }
    }

    return bundledExtensions
      .concat(userExtensions)
      .map(extension => [extension.id, extension]);
  }
);

const ensureExtensionsInjectable = getInjectable({
  instantiate: (di) => ensureExtensions({
    logger: di.inject(extensionsDiscoveryLoggerInjectable),
    loadBundledExtensions: di.inject(loadBundledExtensionsInjectable),
    installDependencies: di.inject(installDependenciesInjectable),
    installDependency: di.inject(installDependencyInjectable),
    lensPackageJsonPath: di.inject(lensPackageJsonPathInjectable),
    loadExternalExtensions: di.inject(loadExternalExtensionsInjectable),
  }),
  id: "ensure-extensions",
});

export default ensureExtensionsInjectable;

