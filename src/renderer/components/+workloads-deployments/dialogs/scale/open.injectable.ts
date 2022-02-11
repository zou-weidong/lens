/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Deployment } from "../../../../../common/k8s-api/endpoints";
import deploymentScaleDialogStateInjectable from "./state.injectable";

export type OpenDeploymentScaleDialog = (deployment: Deployment) => void;

const openDeploymentScaleDialogInjectable = getInjectable({
  instantiate: (di): OpenDeploymentScaleDialog => {
    const state = di.inject(deploymentScaleDialogStateInjectable);

    return (value) => {
      state.set(value);
    };
  },
  id: "open-deployment-scale-dialog",
});

export default openDeploymentScaleDialogInjectable;
