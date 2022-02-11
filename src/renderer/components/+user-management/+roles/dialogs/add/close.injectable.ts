/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addRoleDialogStateInjectable from "./state.injectable";

const closeAddRoleDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(addRoleDialogStateInjectable);

    return () => {
      state.set(false);
    };
  },
  id: "close-add-role-dialog",
});

export default closeAddRoleDialogInjectable;
