/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface HttpsProxy {
  readonly value: string;
  set: (value: string) => void;
}

const httpsProxyInjectable = getInjectable({
  instantiate: (di): HttpsProxy => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.httpsProxy;
      },
      set: (value) => {
        store.httpsProxy = value;
      },
    };
  },
  id: "https-proxy",
});

export default httpsProxyInjectable;
