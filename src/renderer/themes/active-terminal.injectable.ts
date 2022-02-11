/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import terminalThemeIdInjectable from "../../common/user-preferences/active-terminal-theme-id.injectable";
import activeThemeInjectable from "./active.injectable";
import availableThemesInjectable from "./available.injectable";

const activeTerminalThemeInjectable = getInjectable({
  instantiate: (di) => {
    const activeTerminalThemeId = di.inject(terminalThemeIdInjectable);
    const activeTheme = di.inject(activeThemeInjectable);
    const availableThemes = di.inject(availableThemesInjectable);

    return computed(() => (availableThemes.get(activeTerminalThemeId.value) ?? activeTheme.value).terminalColors);
  },
  id: "active-terminal-theme",
});

export default activeTerminalThemeInjectable;
