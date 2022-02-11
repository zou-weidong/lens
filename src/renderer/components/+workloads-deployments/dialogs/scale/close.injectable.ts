/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import deploymentScaleDialogStateInjectable from "./state.injectable";

const closeDeploymentScaleDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(deploymentScaleDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-deployment-scale-dialog",
});

export default closeDeploymentScaleDialogInjectable;
