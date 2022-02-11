/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface OpenAtLogin {
  readonly value: boolean;
  toggle: () => void;
}

const openAtLoginInjectable = getInjectable({
  instantiate: (di): OpenAtLogin => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.openAtLogin;
      },
      toggle: () => {
        store.openAtLogin = !store.openAtLogin;
      },
    };
  },
  id: "open-at-login",
});

export default openAtLoginInjectable;
