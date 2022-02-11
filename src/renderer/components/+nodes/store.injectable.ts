/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import nodeApiInjectable from "../../../common/k8s-api/endpoints/node.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { NodeStore } from "./store";

const nodeStoreInjectable = getInjectable({
  id: "node-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(nodeApiInjectable);

    return new NodeStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default nodeStoreInjectable;
