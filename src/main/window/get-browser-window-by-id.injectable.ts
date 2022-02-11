/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { BrowserWindow } from "electron";

const getBrowserWindowByIdInjectable = getInjectable({
  instantiate: () => (id: number) => BrowserWindow.fromId(id),
  id: "get-browser-window-by-id",
});

export default getBrowserWindowByIdInjectable;
