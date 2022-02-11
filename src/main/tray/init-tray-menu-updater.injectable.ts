/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MenuItemConstructorOptions } from "electron";
import { Menu, Tray } from "electron";
import type { IComputedValue } from "mobx";
import { autorun } from "mobx";
import type { LensLogger } from "../../common/logger";
import type { WindowManager } from "../window/manager";
import packageJson from "../../../package.json";
import isWindowsInjectable from "../../common/vars/is-windows.injectable";
import trayLoggerInjectable from "./logger.injectable";
import computedTrayMenuItemsInjectable from "./menu-items.injectable";
import windowManagerInjectable from "../window/manager.injectable";
import trayIconTemplatePathInjectable from "./tray-icon-template-path.injectable";

// note: instance of Tray should be saved somewhere, otherwise it disappears
let tray: Tray;

interface Dependencies {
  windowManager: WindowManager;
  trayMenuItems: IComputedValue<MenuItemConstructorOptions[]>;
  logger: LensLogger;
  isWindows: boolean;
  trayIconTemplatePath: string;
}

const initTrayMenuUpdater = ({
  windowManager,
  trayMenuItems,
  logger,
  isWindows,
  trayIconTemplatePath,
}: Dependencies) => (
  () => {
    tray = new Tray(trayIconTemplatePath);
    tray.setToolTip(packageJson.description);
    tray.setIgnoreDoubleClickEvents(true);

    if (isWindows) {
      tray.on("click", () => {
        windowManager
          .ensureMainWindow()
          .catch(error => logger.error("Failed to open lens", { error }));
      });
    }

    const stop = autorun(() => {
      try {
        tray.setContextMenu(Menu.buildFromTemplate(trayMenuItems.get()));
      } catch (error) {
        logger.error(`building failed`, { error });
      }
    });

    return () => {
      stop();
      tray?.destroy();
      tray = null;
    };
  }
);

const initTrayMenuUpdaterInjectable = getInjectable({
  instantiate: (di) => initTrayMenuUpdater({
    isWindows: di.inject(isWindowsInjectable),
    logger: di.inject(trayLoggerInjectable),
    trayMenuItems: di.inject(computedTrayMenuItemsInjectable),
    windowManager: di.inject(windowManagerInjectable),
    trayIconTemplatePath: di.inject(trayIconTemplatePathInjectable),
  }),
  id: "init-tray-menu-updater",
});

export default initTrayMenuUpdaterInjectable;
