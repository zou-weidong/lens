/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import helmReleaseRollbackDialogStateInjectable from "./state.injectable";

const closeHelmReleaseRollbackDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(helmReleaseRollbackDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-helm-release-rollback-dialog",
});

export default closeHelmReleaseRollbackDialogInjectable;
