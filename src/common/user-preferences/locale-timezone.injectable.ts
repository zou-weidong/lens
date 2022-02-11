/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface LocaleTimezone {
  readonly value: string;
  set: (value: string) => void;
}

const localeTimezoneInjectable = getInjectable({
  instantiate: (di): LocaleTimezone => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.localeTimezone;
      },
      set: (value) => {
        store.localeTimezone = value;
      },
    };
  },
  id: "locale-timezone",
});

export default localeTimezoneInjectable;

