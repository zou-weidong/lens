/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import addNamespaceDialogStateInjectable from "./state.injectable";

const isAddNamespaceDialogOpenInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(addNamespaceDialogStateInjectable);

    return computed(() => state.isOpen);
  },
  id: "is-add-namespace-dialog-open",
});

export default isAddNamespaceDialogOpenInjectable;
