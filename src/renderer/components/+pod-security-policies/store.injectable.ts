/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import podSecurityPolicyApiInjectable from "../../../common/k8s-api/endpoints/pod-security-policy.api.inejctable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { PodSecurityPolicyStore } from "./store";

const podSecurityPolicyStoreInjectable = getInjectable({
  id: "pod-security-policy-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(podSecurityPolicyApiInjectable);

    return new PodSecurityPolicyStore(api);
  },
});

export default podSecurityPolicyStoreInjectable;
