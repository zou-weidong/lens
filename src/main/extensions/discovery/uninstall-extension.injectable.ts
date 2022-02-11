/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { InstalledExtensions } from "../../../common/extensions/installed.injectable";
import installedExtensionsInjectable from "../../../common/extensions/installed.injectable";
import type { Remove } from "../../../common/fs/remove.injectable";
import removeInjectable from "../../../common/fs/remove.injectable";
import type { LensLogger } from "../../../common/logger";
import extensionsDiscoveryLoggerInjectable from "./logger.injectable";
import type { RemoveSymlinkByExtensionName } from "./remove-symlink-by-name.injectable";
import removeSymlinkByExtensionNameInjectable from "./remove-symlink-by-name.injectable";

export type UninstallExtension = (extId: string) => Promise<void>;

interface Dependencies {
  installedExtensions: InstalledExtensions;
  logger: LensLogger;
  removeSymlinkByExtensionName: RemoveSymlinkByExtensionName;
  remove: Remove;
}

const uninstallExtension = ({
  installedExtensions,
  logger,
  removeSymlinkByExtensionName,
  remove,
}: Dependencies): UninstallExtension => (
  async (extId) => {
    const extension = installedExtensions.get(extId);

    if (!extension) {
      return logger.warn(`Cannot extension ${extId}, not installed`);
    }

    const { manifest, absolutePath } = extension;

    logger.info(`Uninstalling ${manifest.name}`);

    await removeSymlinkByExtensionName(manifest.name);

    // fs.remove does nothing if the path doesn't exist anymore
    await remove(absolutePath);
  }
);

const uninstallExtensionInjectable = getInjectable({
  instantiate: (di) => uninstallExtension({
    installedExtensions: di.inject(installedExtensionsInjectable),
    logger: di.inject(extensionsDiscoveryLoggerInjectable),
    remove: di.inject(removeInjectable),
    removeSymlinkByExtensionName: di.inject(removeSymlinkByExtensionNameInjectable),
  }),
  id: "uninstall-extension",
});

export default uninstallExtensionInjectable;
