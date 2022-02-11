/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface KubeconfigDialogState {
  title: JSX.Element | string;
  loader: () => Promise<any>;
}

const kubeconfigDialogStateInjectable = getInjectable({
  instantiate: () => observable.box<KubeconfigDialogState | undefined>(),
  id: "kubeconfig-dialog-state",
});

export default kubeconfigDialogStateInjectable;

