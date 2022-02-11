/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import horizontalPodAutoscalerApiInjectable from "../../../common/k8s-api/endpoints/horizontal-pod-autoscaler.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { HorizontalPodAutoscalerStore } from "./store";

const horizontalPodAutoscalerStoreInjectable = getInjectable({
  id: "horizontal-pod-autoscaler-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(horizontalPodAutoscalerApiInjectable);

    return  new HorizontalPodAutoscalerStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default horizontalPodAutoscalerStoreInjectable;
