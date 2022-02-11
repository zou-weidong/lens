/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import confirmDialogStateInjectable from "./state.injectable";

const closeConfirmDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(confirmDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-confirm-dialog",
});

export default closeConfirmDialogInjectable;
