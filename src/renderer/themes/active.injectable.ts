/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Theme } from "./theme";
import { systemThemeMatchId } from "./theme";
import activeThemeIdInjectable from "../../common/user-preferences/active-theme-id.injectable";
import availableThemesInjectable from "./available.injectable";
import { defaultTheme } from "../../common/vars";
import type { ReadonlyDeep } from "type-fest";
import osNativeThemeInjectable from "./os-native/theme.injectable";

export interface ActiveTheme {
  readonly value: ReadonlyDeep<Theme>;
  reset: () => void;
}

const activeThemeInjectable = getInjectable({
  instantiate: (di): ActiveTheme => {
    const activeThemeId = di.inject(activeThemeIdInjectable);
    const osNativeTheme = di.inject(osNativeThemeInjectable);
    const availableThemes = di.inject(availableThemesInjectable);

    return {
      get value() {
        const activeId = activeThemeId.value;
        const osTheme = osNativeTheme.type;

        if (activeId === systemThemeMatchId && osTheme) {
          return availableThemes.get(`lens-${osTheme}`);
        }

        return availableThemes.get(activeId) ?? availableThemes.get(defaultTheme);
      },
      reset: () => {
        activeThemeId.reset();
      },
    };
  },
  id: "active-theme",
});

export default activeThemeInjectable;
