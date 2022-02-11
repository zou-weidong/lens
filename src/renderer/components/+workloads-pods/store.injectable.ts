/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import podMetricsApiInjectable from "../../../common/k8s-api/endpoints/pod-metrics.api.injectable";
import podApiInjectable from "../../../common/k8s-api/endpoints/pod.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { PodStore } from "./store";

const podStoreInjectable = getInjectable({
  id: "pod-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(podApiInjectable);

    return new PodStore({
      podMetricsApi: di.inject(podMetricsApiInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default podStoreInjectable;
