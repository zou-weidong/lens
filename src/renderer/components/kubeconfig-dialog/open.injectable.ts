/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import kubeconfigDialogStateInjectable, { KubeconfigDialogState } from "./state.injectable";

export type OpenKubeconfigDialog = (params: KubeconfigDialogState) => void;

const openKubeconfigDialogInjectable = getInjectable({
  instantiate: (di): OpenKubeconfigDialog => {
    const state = di.inject(kubeconfigDialogStateInjectable);

    return (params) => {
      state.set(params);
    };
  },
  id: "open-kubeconfig-dialog",
});

export default openKubeconfigDialogInjectable;
