/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import replicaSetApiInjectable from "../../../common/k8s-api/endpoints/replica-set.api.injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import { ReplicaSetStore } from "./replicasets.store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";

const replicaSetStoreInjectable = getInjectable({
  id: "replica-set-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return null;
    }

    const api = di.inject(replicaSetApiInjectable);

    return new ReplicaSetStore({
      podStore: di.inject(podStoreInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default replicaSetStoreInjectable;
