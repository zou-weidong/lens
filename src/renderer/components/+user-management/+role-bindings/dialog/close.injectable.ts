/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import roleBindingDialogStateInjectable from "./state.injectable";

const closeRoleBindingDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(roleBindingDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-role-binding-dialog",
});

export default closeRoleBindingDialogInjectable;
