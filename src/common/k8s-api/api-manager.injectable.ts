/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { ApiManager } from "./api-manager";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import parseKubeApiInjectable from "./url/parse.injectable";
import type { KubeObject } from "./kube-object";
import type { KubeObjectStore } from "./kube-object.store";
import { createStoresAndApisInjectionToken } from "../vars/create-stores-apis.token";

export const kubeObjectStoreToken = getInjectionToken<KubeObjectStore<KubeObject>>({
  id: "kube-store-token",
});

const apiManagerInjectable = getInjectable({
  id: "api-manager",
  instantiate: (di) => {
    const makeManager = di.inject(createStoresAndApisInjectionToken);

    if (!makeManager) {
      return undefined;
    }

    const apiManager = new ApiManager({
      parseKubeApi: di.inject(parseKubeApiInjectable),
    });

    for (const store of di.injectMany(kubeObjectStoreToken)) {
      apiManager.registerStore(store);
    }

    return apiManager;
  },
});

export default apiManagerInjectable;
