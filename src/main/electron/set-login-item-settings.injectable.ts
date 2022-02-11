/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Settings } from "electron";
import electronAppInjectable from "./app.injectable";

export type SetLoginItemSettings = (settings: Settings) => void;

const setLoginItemSettingsInjectable = getInjectable({
  instantiate: (di): SetLoginItemSettings => {
    const app = di.inject(electronAppInjectable);

    return (settings) => app.setLoginItemSettings(settings);
  },
  id: "set-login-item-settings",
});

export default setLoginItemSettingsInjectable;
