/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { type BrowserWindow, app, dialog } from "electron";
import packageJson from "../../../package.json";
import { getInjectable } from "@ogre-tools/injectable";
import isWindowsInjectable from "../../common/vars/is-windows.injectable";
import appNameInjectable from "../../common/vars/app-name.injectable";
import productNameInjectable from "../../common/vars/product-name.injectable";

export type ShowAbout = (browserWindow: BrowserWindow) => void;

const showAboutInjectable = getInjectable({
  id: "show-about",
  instantiate: (di): ShowAbout => {
    const appName = di.inject(appNameInjectable);
    const productName = di.inject(productNameInjectable);
    const isWindows = di.inject(isWindowsInjectable);
    const title = `${isWindows ? " ".repeat(2) : ""}${appName}`;
    const detail = [
      `${appName}: ${app.getVersion()}`,
      `Electron: ${process.versions.electron}`,
      `Chrome: ${process.versions.chrome}`,
      `Node: ${process.versions.node}`,
      packageJson.copyright,
    ].join("\r\n");

    return (browserWindow) => {
      dialog.showMessageBoxSync(browserWindow, {
        title,
        type: "info",
        buttons: ["Close"],
        message: productName,
        detail,
      });
    };
  },
});

export default showAboutInjectable;

