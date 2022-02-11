/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import podDisruptionBudgetApiInjectable from "../../../common/k8s-api/endpoints/pod-disruption-budget.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { PodDisruptionBudgetStore } from "./store";

const podDisruptionBudgetStoreInjectable = getInjectable({
  id: "pod-disruption-budget-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(podDisruptionBudgetApiInjectable);

    return new PodDisruptionBudgetStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default podDisruptionBudgetStoreInjectable;
