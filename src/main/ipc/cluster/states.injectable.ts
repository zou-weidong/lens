/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { clusterStatesInjectionToken } from "../../../common/ipc/cluster/states.token";
import clusterStoreInjectable from "../../clusters/store.injectable";
import { implWithHandle } from "../impl-channel";

const clusterStatesInjectable = implWithHandle(clusterStatesInjectionToken, async (di) => {
  const store = await di.inject(clusterStoreInjectable);

  return async () => store.clustersList.get().map(cluster => [cluster.id, cluster.getState()]);
});

export default clusterStatesInjectable;
