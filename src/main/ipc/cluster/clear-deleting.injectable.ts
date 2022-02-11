/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { clearClusterDeletingInjectionToken } from "../../../common/ipc/cluster/clear-deleting.token";
import clusterManagerInjectable from "../../clusters/manager.injectable";
import { implWithHandle } from "../impl-channel";

const clearClusterDeletingInjectable = implWithHandle(clearClusterDeletingInjectionToken, async (di) => {
  const manager = await di.inject(clusterManagerInjectable);

  return async (clusterId) => {
    manager.clearAsDeleting(clusterId);
  };
});

export default clearClusterDeletingInjectable;
