/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import getClusterByIdInjectable from "../../../common/clusters/get-by-id.injectable";
import { kubectlDeleteAllInjectionToken } from "../../../common/ipc/kubectl/delete-all.token";
import createResourceApplierInjectable from "../../kube-resources/create-applier.injectable";
import { implWithHandle } from "../impl-channel";

const kubectlDeleteAllInjectable = implWithHandle(kubectlDeleteAllInjectionToken, async (di) => {
  const appEventBus = await di.inject(appEventBusInjectable);
  const getClusterById = await di.inject(getClusterByIdInjectable);
  const createResourceApplier = await di.inject(createResourceApplierInjectable);

  return async (clusterId, resources, extraArgs) => {
    appEventBus.emit({ name: "cluster", action: "kubectl-delete-all" });
    const cluster = getClusterById(clusterId);

    if (cluster) {
      try {
        const stdout = await createResourceApplier(cluster).kubectlDeleteAll(resources, extraArgs);

        return { stdout };
      } catch (error) {
        return { stderr: String(error) };
      }
    } else {
      throw `${clusterId} is not a valid cluster id`;
    }
  };
});

export default kubectlDeleteAllInjectable;
