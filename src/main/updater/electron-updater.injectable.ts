/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { autoUpdater } from "electron-updater";

const electronUpdaterInjectable = getInjectable({
  instantiate: () => autoUpdater,
  id: "electron-updater",
});

export default electronUpdaterInjectable;
