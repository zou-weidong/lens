/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ReplicaSet } from "../../../../../common/k8s-api/endpoints";
import replicaSetScaleDialogStateInjectable from "./state.injectable";

export type OpenReplicaSetScaleDialog = (replicaSet: ReplicaSet) => void;

const openReplicaSetScaleDialogInjectable = getInjectable({
  instantiate: (di): OpenReplicaSetScaleDialog => {
    const state = di.inject(replicaSetScaleDialogStateInjectable);

    return (replicaSet) => {
      state.set(replicaSet);
    };
  },
  id: "open-replica-set-scale-dialog",
});

export default openReplicaSetScaleDialogInjectable;
