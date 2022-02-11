/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import type { InstalledExtensions } from "../../../../common/extensions/installed.injectable";
import installedExtensionsInjectable from "../../../../common/extensions/installed.injectable";
import type { LensLogger } from "../../../../common/logger";
import localExtensionsDirectoryInjectable from "../../../../common/paths/local-extensions.injectable";
import { iter, noop } from "../../../../common/utils";
import extensionsDiscoveryLoggerInjectable from "../logger.injectable";
import type { RemoveSymlinkByExtensionName } from "../remove-symlink-by-name.injectable";
import removeSymlinkByExtensionNameInjectable from "../remove-symlink-by-name.injectable";

export type OnWatchUnlink = (filePath: string) => void;

interface Dependencies {
  installedExtensions: InstalledExtensions;
  localExtensionsDirectory: string;
  logger: LensLogger;
  removeSymlinkByExtensionName: RemoveSymlinkByExtensionName;
}

const onWatchUnlink = ({
  installedExtensions,
  localExtensionsDirectory,
  logger,
  removeSymlinkByExtensionName,
}: Dependencies): OnWatchUnlink => (
  (filePath) => {
    // Check that the removed path is directly under localExtensionsDirectory
    // Note that the watcher can create unlink events for subdirectories of the extension
    const extensionFolderName = path.basename(filePath);
    const expectedPath = path.relative(localExtensionsDirectory, filePath);

    if (expectedPath !== extensionFolderName) {
      return;
    }

    const extension = iter.find(installedExtensions.values(), ext => ext.absolutePath === filePath);

    if (!extension) {
      return logger.warn(`extension ${extensionFolderName} not found, can't remove`);
    }

    const extensionName = extension.manifest.name;

    logger.info(`removed extension ${extensionName}`);
    installedExtensions.delete(extension.id);

    // If the extension is deleted manually while the application is running, also remove the symlink
    // Do this out of line so that this handler isn't async
    removeSymlinkByExtensionName(extensionName).catch(noop);
  }
);


const onWatchUnlinkInjectable = getInjectable({
  instantiate: (di) => onWatchUnlink({
    installedExtensions: di.inject(installedExtensionsInjectable),
    localExtensionsDirectory: di.inject(localExtensionsDirectoryInjectable),
    logger: di.inject(extensionsDiscoveryLoggerInjectable),
    removeSymlinkByExtensionName: di.inject(removeSymlinkByExtensionNameInjectable),
  }),
  id: "on-watch-unlink",
});

export default onWatchUnlinkInjectable;

