/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addClusterRoleDialogStateInjectable from "./state.injectable";

const closeAddClusterRoleDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(addClusterRoleDialogStateInjectable);

    return () => {
      state.set(false);
    };
  },
  id: "close-add-cluster-role-dialog",
});

export default closeAddClusterRoleDialogInjectable;
