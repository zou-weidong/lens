/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AppUpdater, UpdateInfo } from "electron-updater";
import { once } from "lodash";
import emitUpdateAvailableInjectable from "../../common/ipc/updates/available/emit.injectable";
import type { UpdateAvailable } from "../../common/ipc/updates/available/emit.token";
import emitUpdateNotAvailableInjectable from "../../common/ipc/updates/not-available/emit.injectable";
import type { UpdateNotAvailable } from "../../common/ipc/updates/not-available/emit.token";
import type { LensLogger } from "../../common/logger";
import isTestEnvInjectable from "../../common/vars/is-test-env.injectable";
import electronUpdaterInjectable from "./electron-updater.injectable";
import type { IsAutoUpdateEnabled } from "./is-auto-update-enabled.injectable";
import isAutoUpdateEnabledInjectable from "./is-auto-update-enabled.injectable";
import updaterLoggerInjectable from "./logger.injectable";
import { nextUpdateChannel } from "../utils";
import type { CheckForUpdates } from "./check-for-updates.injectable";
import { delay } from "../../common/utils";
import checkForUpdatesInjectable from "./check-for-updates.injectable";
import type { UpdateChannel } from "../../common/user-preferences/update-channel.injectable";
import updateChannelInjectable from "../../common/user-preferences/update-channel.injectable";

interface Dependencies {
  isAutoUpdateEnabled: IsAutoUpdateEnabled;
  isTestEnv: boolean;
  updateChannel: UpdateChannel;
  autoUpdater: AppUpdater;
  logger: LensLogger;
  emitUpdateAvailable: UpdateAvailable;
  emitUpdateNotAvailable: UpdateNotAvailable;
  checkForUpdates: CheckForUpdates;
}

export type StartUpdateChecking = (intervalMs?: number) => void;

let installVersion: null | string = null;

const startUpdateChecking = ({ isAutoUpdateEnabled, isTestEnv, updateChannel, autoUpdater, logger, emitUpdateAvailable, emitUpdateNotAvailable, checkForUpdates }: Dependencies): StartUpdateChecking => (
  once((intervalMs = 1000 * 60 * 60 * 24) => {
    const autoUpdateDisabled = !isAutoUpdateEnabled() || isTestEnv;

    logger.info(`auto updating is ${autoUpdateDisabled ? "disabled" : "enabled"}`);

    if (autoUpdateDisabled) {
      return;
    }

    autoUpdater.logger = logger;
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = false;
    autoUpdater.channel = updateChannel.value;
    autoUpdater.allowDowngrade = updateChannel.isAllowedToDowngrade;

    autoUpdater
      .on("update-available", (info: UpdateInfo) => {
        if (autoUpdater.autoInstallOnAppQuit) {
          // a previous auto-update loop was completed with YES+LATER, check if same version
          if (installVersion === info.version) {
            // same version, don't broadcast
            return;
          }
        }

        /**
         * This should be always set to false here because it is the reasonable
         * default. Namely, if a don't auto update to a version that the user
         * didn't ask for.
         */
        autoUpdater.autoInstallOnAppQuit = false;
        installVersion = info.version;

        autoUpdater.downloadUpdate()
          .catch(error => logger.error("failed to download update", error));
      })
      .on("update-downloaded", (info: UpdateInfo) => {
        logger.info("broadcasting update available", { version: info.version });
        emitUpdateAvailable(info);
      })
      .on("update-not-available", () => {
        const nextChannel = nextUpdateChannel(updateChannel.value, autoUpdater.channel);

        logger.info(`update not available from ${autoUpdater.channel}, will check ${nextChannel} channel next`);

        if (nextChannel !== autoUpdater.channel) {
          autoUpdater.channel = nextChannel;
          autoUpdater.checkForUpdates()
            .catch(error => logger.error(`failed with an error`, error));
        } else {
          emitUpdateNotAvailable();
        }
      });

    // This is the polling watch
    (async () => {
      for (;;) {
        await checkForUpdates();
        await delay(intervalMs);
      }
    })();
  })
);

const startUpdateCheckingInjectable = getInjectable({
  instantiate: (di) => startUpdateChecking({
    isAutoUpdateEnabled: di.inject(isAutoUpdateEnabledInjectable),
    isTestEnv: di.inject(isTestEnvInjectable),
    updateChannel: di.inject(updateChannelInjectable),
    autoUpdater: di.inject(electronUpdaterInjectable),
    logger: di.inject(updaterLoggerInjectable),
    emitUpdateAvailable: di.inject(emitUpdateAvailableInjectable),
    emitUpdateNotAvailable: di.inject(emitUpdateNotAvailableInjectable),
    checkForUpdates: di.inject(checkForUpdatesInjectable),
  }),
  id: "start-update-checking",
});

export default startUpdateCheckingInjectable;
