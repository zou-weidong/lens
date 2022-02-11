/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { updateAvailableRespondInjectionToken } from "../../../common/ipc/updates/respond.token";
import isLinuxInjectable from "../../../common/vars/is-linux.injectable";
import isMacInjectable from "../../../common/vars/is-mac.injectable";
import updaterLoggerInjectable from "../../updater/logger.injectable";
import { implWithOn } from "../impl-channel";
import { autoUpdater as electronAutoUpdater } from "electron";
import { autoUpdater } from "electron-updater";

const updateAvailableRespondInjectable = implWithOn(updateAvailableRespondInjectionToken, async (di) => {
  const logger = await di.inject(updaterLoggerInjectable);
  const isMac = await di.inject(isMacInjectable);
  const isLinux = await di.inject(isLinuxInjectable);

  return (response) => {
    if (!response.doUpgrade) {
      return void logger.info("User chose not to update");
    }

    if (!response.now) {
      autoUpdater.autoInstallOnAppQuit = true;

      return void logger.info("User chose to update on quit");
    }

    logger.info("User chose to update now");

    if (isMac) {
      /**
       * This is a necessary workaround until electron-updater is fixed.
       * The problem is that it downloads it but then never tries to
       * download it from itself via electron.
       */
      electronAutoUpdater.checkForUpdates();
    } else if (isLinux) {
      /**
       * This is a necessary workaround until electron-updater is fixed.
       * The problem is that because linux updating is not implemented at
       * all via electron. Electron's autoUpdater.quitAndInstall() is never
       * called.
       */
      electronAutoUpdater.emit("before-quit-for-update");
    }
    autoUpdater.quitAndInstall(true, true);
  };
});

export default updateAvailableRespondInjectable;
