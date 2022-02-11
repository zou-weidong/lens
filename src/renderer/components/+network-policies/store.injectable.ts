/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import networkPolicyApiInjectable from "../../../common/k8s-api/endpoints/network-policy.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { NetworkPolicyStore } from "./store";

const networkPolicyStoreInjectable = getInjectable({
  id: "network-policy-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(networkPolicyApiInjectable);

    return new NetworkPolicyStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default networkPolicyStoreInjectable;
