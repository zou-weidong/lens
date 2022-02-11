/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { setClusterAsVisibleInjectionToken } from "../../../common/ipc/cluster/set-as-visible.token";
import clusterManagerInjectable from "../../clusters/manager.injectable";
import { implWithOn } from "../impl-channel";

const setClusterAsVisibleInjectable = implWithOn(setClusterAsVisibleInjectionToken, async (di) => {
  const clusterManager = await di.inject(clusterManagerInjectable);

  return (clusterId) => {
    clusterManager.visibleCluster = clusterId;
  };
});

export default setClusterAsVisibleInjectable;
