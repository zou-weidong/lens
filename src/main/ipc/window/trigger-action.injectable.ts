/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { BrowserWindow } from "electron";
import { triggerWindowActionInjectionToken, WindowAction } from "../../../common/ipc/window/trigger-action.token";
import type { LensLogger } from "../../../common/logger";
import { baseLoggerInjectionToken } from "../../../common/logger/base-logger.token";
import { implWithOn } from "../impl-channel";

interface Dependencies {
  logger: LensLogger;
}

const handleWindowAction = ({ logger }: Dependencies) => (
  (action: WindowAction) => {
    const window = BrowserWindow.getFocusedWindow();

    if (!window) {
      logger.warn(`Attempted window action ${action} but there is no focused window`);
    }

    switch (action) {
      case WindowAction.GO_BACK: {
        window.webContents.goBack();
        break;
      }

      case WindowAction.GO_FORWARD: {
        window.webContents.goForward();
        break;
      }

      case WindowAction.MINIMIZE: {
        window.minimize();
        break;
      }

      case WindowAction.TOGGLE_MAXIMIZE: {
        if (window.isMaximized()) {
          window.unmaximize();
        } else {
          window.maximize();
        }
        break;
      }

      case WindowAction.CLOSE: {
        window.close();
        break;
      }

      default:
        throw new Error(`Attemped window action ${action} is unknown`);
    }
  }
);

const triggerWindowActionInjectable = implWithOn(triggerWindowActionInjectionToken, async (di) => (
  handleWindowAction({
    logger: await di.inject(baseLoggerInjectionToken),
  })
));

export default triggerWindowActionInjectable;
