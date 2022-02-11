/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ClusterOverviewStore } from "./store";
import { kubeObjectStoreToken } from "../../../../common/k8s-api/api-manager.injectable";
import clusterOverviewStorageInjectable from "./storage.injectable";
import clusterApiInjectable from "../../../../common/k8s-api/endpoints/cluster.api.injectable";
import nodeStoreInjectable from "../../+nodes/store.injectable";

const clusterOverviewStoreInjectable = getInjectable({
  instantiate: (di) => {
    const api = di.inject(clusterApiInjectable);

    return new ClusterOverviewStore({
      storage: di.inject(clusterOverviewStorageInjectable),
      nodeStore: di.inject(nodeStoreInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreToken,
  id: "cluster-overview-store",
});

export default clusterOverviewStoreInjectable;
