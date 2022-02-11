/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterRoleBinding } from "../../../../../common/k8s-api/endpoints";
import { getInjectable } from "@ogre-tools/injectable";
import clusterRoleBindingsDialogStateInjectable from "./state.injectable";

export type OpenClusterRoleBindingDialog = (clusterRoleBinding?: ClusterRoleBinding) => void;

const openClusterRoleBindingDialogInjectable = getInjectable({
  instantiate: (di): OpenClusterRoleBindingDialog => {
    const state = di.inject(clusterRoleBindingsDialogStateInjectable);

    return (val) => {
      state.set({
        data: val,
        isEditing: Boolean(val),
      });
    };
  },
  id: "open-cluster-role-binding-dialog",
});

export default openClusterRoleBindingDialogInjectable;
