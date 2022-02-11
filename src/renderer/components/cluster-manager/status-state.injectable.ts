/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action, observable } from "mobx";
import type { ClusterId, KubeAuthUpdate } from "../../../common/clusters/cluster-types";

export interface ClusterConnectionStatus {
  get: (clusterId: ClusterId) => readonly KubeAuthUpdate[];
  push: (clusterId: ClusterId, update: KubeAuthUpdate) => void;
  clear: (clusterId: ClusterId) => void;
}

const clusterConnectionStatusStateInjectable = getInjectable({
  instantiate: (): ClusterConnectionStatus => {
    const state = observable.map<ClusterId, KubeAuthUpdate[]>();

    return {
      get: (clusterId) => state.get(clusterId) ?? [],
      push: action((clusterId, update) => {
        if (!state.has(clusterId)) {
          state.set(clusterId, []);
        }

        state.get(clusterId).push(update);
      }),
      clear: (clusterId) => state.delete(clusterId),
    };
  },
  id: "cluster-connection-status-state",
});

export default clusterConnectionStatusStateInjectable;
