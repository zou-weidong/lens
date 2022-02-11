/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import kubeconfigDialogStateInjectable from "./state.injectable";

const closeKubeconfigDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(kubeconfigDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-kubeconfig-dialog",
});

export default closeKubeconfigDialogInjectable;
