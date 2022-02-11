/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import getClusterByIdInjectable from "../../../common/clusters/get-by-id.injectable";
import { setClusterFrameIdInjectionToken } from "../../../common/ipc/cluster/set-frame-id.token";
import clusterFramesInjectable from "../../clusters/frames.injectable";
import { implWithRawHandle } from "../impl-channel";

const setClusterFrameIdInjectable = implWithRawHandle(setClusterFrameIdInjectionToken, async (di) => {
  const getClusterById = await di.inject(getClusterByIdInjectable);
  const clusterFrames = await di.inject(clusterFramesInjectable);

  return async (event, clusterId) => {
    const cluster = getClusterById(clusterId);

    if (cluster) {
      clusterFrames.set(cluster.id, { frameId: event.frameId, processId: event.processId });
      cluster.pushState();
    }
  };
});

export default setClusterFrameIdInjectable;
