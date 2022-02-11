/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import deleteClusterDialogStateInjectable from "./state.injectable";

const closeDeleteClusterDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(deleteClusterDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-delete-cluster-dialog",
});

export default closeDeleteClusterDialogInjectable;
