/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import configMapApiInjectable from "../../../common/k8s-api/endpoints/config-map.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { ConfigMapStore } from "./store";

const configMapStoreInjectable = getInjectable({
  id: "config-map-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(configMapApiInjectable);

    return new ConfigMapStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default configMapStoreInjectable;
