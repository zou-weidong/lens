/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

export interface AddQuotaDialogState {
  isOpen: boolean;
}

const addQuotaDialogStateInjectable = getInjectable({
  instantiate: () => observable.object<AddQuotaDialogState>({
    isOpen: false,
  }),
  id: "add-quota-dialog-state",
});

export default addQuotaDialogStateInjectable;
