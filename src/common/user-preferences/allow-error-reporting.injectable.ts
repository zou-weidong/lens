/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface AllowErrorReporting {
  readonly value: boolean;
  toggle: () => void;
}

const allowErrorReportingInjectable = getInjectable({
  id: "allow-error-reporting",
  instantiate: (di): AllowErrorReporting => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.allowErrorReporting;
      },
      toggle: () => {
        store.allowErrorReporting = !store.allowErrorReporting;
      },
    };
  },
});

export default allowErrorReportingInjectable;
