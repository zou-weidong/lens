/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import getClusterByIdInjectable from "../../../common/clusters/get-by-id.injectable";
import { disconnectClusterInjectionToken } from "../../../common/ipc/cluster/disconnect.token";
import clusterFramesInjectable from "../../clusters/frames.injectable";
import { implWithHandle } from "../impl-channel";

const disconnectClusterInjectable = implWithHandle(disconnectClusterInjectionToken, async (di) => {
  const getClusterById = await di.inject(getClusterByIdInjectable);
  const clusterFrames = await di.inject(clusterFramesInjectable);
  const appEventBus = await di.inject(appEventBusInjectable);

  return async (id) => {
    appEventBus.emit({ name: "cluster", action: "stop" });
    const cluster = getClusterById(id);

    if (cluster) {
      cluster.disconnect();
      clusterFrames.delete(id);
    }
  };
});

export default disconnectClusterInjectable;
