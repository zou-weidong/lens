/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface AddSecretDialogState {
  isOpen: boolean;
}

const addSecretDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<AddSecretDialogState>({
    isOpen: false,
  }),
  id: "add-secret-dialog-state",
});

export default addSecretDialogStateInjectable;
