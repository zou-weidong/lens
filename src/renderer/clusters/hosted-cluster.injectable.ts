/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hostedClusterIdInjectable from "./hosted-cluster-id.injectable";
import clusterStoreInjectable from "./store.injectable";

const hostedClusterInjectable = getInjectable({
  instantiate: (di) => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);

    return di.inject(clusterStoreInjectable).getById(hostedClusterId);
  },
  id: "hosted-cluster",
});

export default hostedClusterInjectable;
