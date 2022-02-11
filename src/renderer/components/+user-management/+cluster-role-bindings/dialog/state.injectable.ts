/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { ClusterRoleBinding } from "../../../../../common/k8s-api/endpoints";

export interface ClusterRoleBindingsDialogState {
  data: ClusterRoleBinding | undefined;
  isEditing: boolean;
}

const clusterRoleBindingsDialogStateInjectable = getInjectable({
  instantiate: () => observable.box<ClusterRoleBindingsDialogState | undefined>(undefined),
  id: "cluster-role-bindings-dialog-state",
});

export default clusterRoleBindingsDialogStateInjectable;
