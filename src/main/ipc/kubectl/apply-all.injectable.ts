/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import getClusterByIdInjectable from "../../../common/clusters/get-by-id.injectable";
import { kubectlApplyAllInjectionToken } from "../../../common/ipc/kubectl/apply-all.token";
import createResourceApplierInjectable from "../../kube-resources/create-applier.injectable";
import { implWithHandle } from "../impl-channel";

const kubectlApplyAllInjectable = implWithHandle(kubectlApplyAllInjectionToken, async (di) => {
  const appEventBus = await di.inject(appEventBusInjectable);
  const getClusterById = await di.inject(getClusterByIdInjectable);
  const createResourceApplier = await di.inject(createResourceApplierInjectable);

  return async (clusterId, resources, extraArgs) => {
    appEventBus.emit({ name: "cluster", action: "kubectl-apply-all" });
    const cluster = getClusterById(clusterId);

    if (cluster) {
      try {
        const stdout = await createResourceApplier(cluster).kubectlApplyAll(resources, extraArgs);

        return { stdout };
      } catch (error) {
        return { stderr: String(error) };
      }
    } else {
      throw new Error(`${clusterId} is not a known ClusterId`);
    }
  };
});

export default kubectlApplyAllInjectable;
