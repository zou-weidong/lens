/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { MenuItemConstructorOptions } from "electron";
import type { IComputedValue } from "mobx";
import { computed } from "mobx";
import type { NavigateInApp } from "../../common/ipc/window/navigate-in-app.token";
import type { LensLogger } from "../../common/logger";
import { preferencesURL } from "../../common/routes";
import productNameInjectable from "../../common/vars/product-name.injectable";
import type { ExitApp } from "../exit-app.injectable";
import exitAppInjectable from "../exit-app.injectable";
import navigateInAppInjectable from "../ipc/window/navigate-in-app.injectable";
import showAboutInjectable, { type ShowAbout } from "../menu/show-about.injectable.ts";
import type { CheckForUpdates } from "../updater/check-for-updates.injectable";
import checkForUpdatesInjectable from "../updater/check-for-updates.injectable";
import type { IsAutoUpdateEnabled } from "../updater/is-auto-update-enabled.injectable";
import isAutoUpdateEnabledInjectable from "../updater/is-auto-update-enabled.injectable";
import { array } from "../utils";
import type { WindowManager } from "../window/manager";
import windowManagerInjectable from "../window/manager.injectable";
import extensionTrayMenuItemsInjectable from "./extension-menu-items.injectable";
import trayLoggerInjectable from "./logger.injectable";
import type { TrayMenuRegistration } from "./tray-menu-registration";

interface Dependencies {
  extensionItems: IComputedValue<TrayMenuRegistration[]>;
  windowManager: WindowManager;
  logger: LensLogger;
  navigate: NavigateInApp;
  isAutoUpdateEnabled: IsAutoUpdateEnabled;
  checkForUpdates: CheckForUpdates;
  exitApp: ExitApp;
  showAbout: ShowAbout;
  productName: string;
}

function getMenuItemConstructorOptions(trayItem: TrayMenuRegistration): Electron.MenuItemConstructorOptions {
  return {
    ...trayItem,
    submenu: trayItem.submenu ? trayItem.submenu.map(getMenuItemConstructorOptions) : undefined,
    click: trayItem.click
      ? () => trayItem.click(trayItem)
      : undefined,
  };
}

const trayMenuItems = ({
  extensionItems,
  windowManager,
  logger,
  navigate,
  isAutoUpdateEnabled,
  checkForUpdates,
  exitApp,
  showAbout,
  productName,
}: Dependencies): IComputedValue<MenuItemConstructorOptions[]> => (
  computed(() => [
    {
      label: `About ${productName}`,
      click() {
        (async () => {
          try {
            showAbout(await windowManager.ensureMainWindow());
          } catch (error) {
            logger.error("Failed to show Lens About view", { error });
          }
        })();
      },
    },
    { type: "separator" },
    {
      label: "Quit App",
      click() {
        exitApp();
      },
    },
    {
      label: `Open ${productName}`,
      click() {
        windowManager
          .ensureMainWindow()
          .catch(error => logger.error("Failed to open lens", error));
      },
    },
    {
      label: "Preferences",
      click() {
        navigate(preferencesURL());
      },
    },
    ...array.ignoreIf(isAutoUpdateEnabled(), [
      {
        label: "Check for updates",
        click() {
          checkForUpdates()
            .then(() => windowManager.ensureMainWindow());
        },
      },
    ]),
    ...extensionItems.get().map(getMenuItemConstructorOptions),
  ])
);

const computedTrayMenuItemsInjectable = getInjectable({
  instantiate: (di) => trayMenuItems({
    extensionItems: di.inject(extensionTrayMenuItemsInjectable),
    windowManager: di.inject(windowManagerInjectable),
    logger: di.inject(trayLoggerInjectable),
    navigate: di.inject(navigateInAppInjectable),
    checkForUpdates: di.inject(checkForUpdatesInjectable),
    isAutoUpdateEnabled: di.inject(isAutoUpdateEnabledInjectable),
    exitApp: di.inject(exitAppInjectable),
    showAbout: di.inject(showAboutInjectable),
    productName: di.inject(productNameInjectable),
  }),
  id: "computed-tray-menu-items",
});

export default computedTrayMenuItemsInjectable;
