/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addNamespaceDialogStateInjectable from "./state.injectable";

const closeAddNamespaceDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(addNamespaceDialogStateInjectable);

    return () => {
      state.isOpen = false;
    };
  },
  id: "close-add-namespace-dialog",
});

export default closeAddNamespaceDialogInjectable;
