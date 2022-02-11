/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clusterStatesInjectionToken } from "../../common/ipc/cluster/states.token";
import clusterStoreInjectable from "./store.injectable";

const syncInitialStateInjectable = getInjectable({
  id: "sync-initial-state",
  setup: async (di) => {
    const clusterStates = await di.inject(clusterStatesInjectionToken.token);
    const store = await di.inject(clusterStoreInjectable);

    // TODO: remove this once cluster state is part of the catalog
    for (const [clusterId, state] of await clusterStates()) {
      store.getById(clusterId)?.setState(state);
    }
  },
  instantiate: () => undefined,
});

export default syncInitialStateInjectable;
