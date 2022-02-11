/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clusterStoreInjectionToken } from "../../common/clusters/store-injection-token";
import createClusterStoreInjectable from "../../common/clusters/create-store.injectable";

const clusterStoreInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(createClusterStoreInjectable, {});

    store.load();

    return store;
  },
  injectionToken: clusterStoreInjectionToken,
  id: "cluster-store",
});

export default clusterStoreInjectable;
