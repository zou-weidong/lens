/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import emitCheckingForUpdatesInjectable from "../../common/ipc/updates/checking/emit.injectable";
import type { LensLogger } from "../../common/logger";
import updaterLoggerInjectable from "./logger.injectable";
import type { AppUpdater } from "electron-updater";
import electronUpdaterInjectable from "./electron-updater.injectable";
import type { UpdateChannel } from "../../common/user-preferences/update-channel.injectable";
import updateChannelInjectable from "../../common/user-preferences/update-channel.injectable";

interface Dependencies {
  updateChannel: UpdateChannel;
  emitCheckingForUpdates: () => void;
  logger: LensLogger;
  autoUpdater: AppUpdater;
}

export type CheckForUpdates = () => Promise<void>;

const checkForUpdates = ({ updateChannel, emitCheckingForUpdates, logger, autoUpdater }: Dependencies) => (
  async () => {
    logger.info(`📡 Checking for app updates`);
    autoUpdater.channel = updateChannel.value;
    autoUpdater.allowDowngrade = updateChannel.isAllowedToDowngrade;
    emitCheckingForUpdates();

    try {
      await autoUpdater.checkForUpdates();
    } catch (error) {
      logger.error("Check for updates failed", error);
    }
  }
);

const checkForUpdatesInjectable = getInjectable({
  instantiate: (di) => checkForUpdates({
    updateChannel: di.inject(updateChannelInjectable),
    emitCheckingForUpdates: di.inject(emitCheckingForUpdatesInjectable),
    logger: di.inject(updaterLoggerInjectable),
    autoUpdater: di.inject(electronUpdaterInjectable),
  }),
  id: "check-for-updates",
});

export default checkForUpdatesInjectable;
