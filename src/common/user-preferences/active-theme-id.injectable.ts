/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { ThemeId } from "../../renderer/themes/theme";
import { defaultTheme } from "../vars";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface ActiveThemeId {
  readonly value: ThemeId;
  set: (themeId: ThemeId) => void;
  reset: () => void;
}

const activeThemeIdInjectable = getInjectable({
  id: "active-theme-id",
  instantiate: (di): ActiveThemeId => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.colorTheme;
      },
      set: (themeId) => {
        store.colorTheme = themeId;
      },
      reset: () => {
        store.colorTheme = defaultTheme;
      },
    };
  },
});

export default activeThemeIdInjectable;
