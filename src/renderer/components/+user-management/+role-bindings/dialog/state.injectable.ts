/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { RoleBinding } from "../../../../../common/k8s-api/endpoints";

export interface RoleBindingDialogState {
  data: RoleBinding | undefined;
  isEditing: boolean;
}

const roleBindingDialogStateInjectable = getInjectable({
  instantiate: () => observable.box<RoleBindingDialogState | undefined>(undefined),
  id: "role-binding-dialog-state",
});

export default roleBindingDialogStateInjectable;
