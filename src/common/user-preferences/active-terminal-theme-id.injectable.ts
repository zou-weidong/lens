/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface ActiveTerminalThemeId {
  readonly value: string | undefined;
  set: (id: string) => void;
}

const activeTerminalThemeIdInjectable = getInjectable({
  instantiate: (di): ActiveTerminalThemeId => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.terminalTheme;
      },
      set: (id) => {
        store.terminalTheme = id;
      },
    };
  },
  id: "active-terminal-theme-id",
});

export default activeTerminalThemeIdInjectable;
