/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { extensionDisplayName } from "../../../extensions/lens-extension";
import React from "react";
import { IComputedValue, when } from "mobx";
import { getMessageFromError } from "./get-message-from-error";
import type { OkNotification } from "../notifications/ok.injectable";
import type { ErrorNotification } from "../notifications/error.injectable";
import type { LensLogger } from "../../../common/logger";
import type { UninstallExtension } from "../../../common/ipc/extensions/uninstall.token";
import { getInjectable } from "@ogre-tools/injectable";
import extensionsPageLoggerInjectable from "./logger.injectable";
import errorNotificationInjectable from "../notifications/error.injectable";
import okNotificationInjectable from "../notifications/ok.injectable";
import requestUninstallExtensionInjectable from "../../ipc/extensions/uninstall.injectable";
import type { LensExtensionId } from "../../../common/extensions/manifest";
import type { InstalledExtensions } from "../../../common/extensions/installed.injectable";
import installedExtensionsInjectable from "../../../common/extensions/installed.injectable";
import enabledUserExtensionIdsInjectable from "../../../common/extensions/enabled-user-extension-ids.injectable";
import type { ExtensionInstallationStateManager } from "../../../common/extensions/installation-state/manager";
import extensionInstallationStateManagerInjectable from "../../../common/extensions/installation-state/manager.injectable";

export type CheckedUninstallExtension = (extensionId: LensExtensionId) => Promise<boolean>;

interface Dependencies {
  enabledUserExtensionIds: IComputedValue<Set<LensExtensionId>>;
  installedExtensions: InstalledExtensions;
  installStateStore: ExtensionInstallationStateManager;
  okNotification: OkNotification;
  errorNotification: ErrorNotification;
  logger: LensLogger;
  uninstallExtension: UninstallExtension;
}

const checkedUninstallExtension = ({
  enabledUserExtensionIds,
  installedExtensions,
  uninstallExtension,
  installStateStore,
  okNotification,
  errorNotification,
  logger,
}: Dependencies): CheckedUninstallExtension => (
  async (extensionId) => {
    const { manifest } = installedExtensions.get(extensionId);
    const displayName = extensionDisplayName(manifest.name, manifest.version);

    try {
      logger.debug(`trying to uninstall ${extensionId}`);
      installStateStore.setUninstalling(extensionId);

      await uninstallExtension(extensionId);

      // wait for the extension to no longer be installed
      await when(() => !enabledUserExtensionIds.get().has(extensionId));

      okNotification(
        <p>
          Extension <b>{displayName}</b> successfully uninstalled!
        </p>,
      );

      return true;
    } catch (error) {
      const message = getMessageFromError(error);

      logger.info(`uninstalling ${displayName} has failed`, error);
      errorNotification(
        <p>
          Uninstalling extension <b>{displayName}</b> has failed: <em>{message}</em>
        </p>,
      );

      return false;
    } finally {
      // Remove uninstall state on uninstall failure
      installStateStore.clearUninstalling(extensionId);
    }
  }
);

const checkedUninstallExtensionInjectable = getInjectable({
  instantiate: (di) => checkedUninstallExtension({
    installedExtensions: di.inject(installedExtensionsInjectable),
    enabledUserExtensionIds: di.inject(enabledUserExtensionIdsInjectable),
    uninstallExtension: di.inject(requestUninstallExtensionInjectable),
    installStateStore: di.inject(extensionInstallationStateManagerInjectable),
    logger: di.inject(extensionsPageLoggerInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    okNotification: di.inject(okNotificationInjectable),
  }),
  id: "checked-uninstall-extension",
});

export default checkedUninstallExtensionInjectable;
