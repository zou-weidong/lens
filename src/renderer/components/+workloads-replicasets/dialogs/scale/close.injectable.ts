/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import replicaSetScaleDialogStateInjectable from "./state.injectable";

const closeReplicaSetScaleDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(replicaSetScaleDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-replica-set-scale-dialog",
});

export default closeReplicaSetScaleDialogInjectable;
