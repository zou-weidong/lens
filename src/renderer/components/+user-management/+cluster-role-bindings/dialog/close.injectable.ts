/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import clusterRoleBindingsDialogStateInjectable from "./state.injectable";

const closeClusterRoleBindingDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(clusterRoleBindingsDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-cluster-role-binding-dialog",
});

export default closeClusterRoleBindingDialogInjectable;
