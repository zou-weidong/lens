/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface AddNamespaceDialogState {
  isOpen: boolean;
}

const addNamespaceDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<AddNamespaceDialogState>({
    isOpen: false,
  }),
  id: "add-namespace-dialog-state",
});

export default addNamespaceDialogStateInjectable;
