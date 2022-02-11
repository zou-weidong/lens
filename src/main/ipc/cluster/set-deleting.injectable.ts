/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { setClusterDeletingInjectionToken } from "../../../common/ipc/cluster/set-deleting.token";
import clusterManagerInjectable from "../../clusters/manager.injectable";
import { implWithHandle } from "../impl-channel";

const setClusterDeletingInjectable = implWithHandle(setClusterDeletingInjectionToken, async (di) => {
  const manager = await di.inject(clusterManagerInjectable);

  return async (clusterId) => {
    manager.setAsDeleting(clusterId);
  };
});

export default setClusterDeletingInjectable;
