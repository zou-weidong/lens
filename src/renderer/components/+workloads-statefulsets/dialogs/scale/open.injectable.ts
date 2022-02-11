/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { StatefulSet } from "../../../../../common/k8s-api/endpoints";
import statefulSetScaleDialogStateInjectable from "./state.injectable";

export type OpenStatefulSetScaleDialog = (statefulSet: StatefulSet) => void;

const openStatefulSetScaleDialogInjectable = getInjectable({
  instantiate: (di): OpenStatefulSetScaleDialog => {
    const state = di.inject(statefulSetScaleDialogStateInjectable);

    return (statefulSet) => {
      state.set(statefulSet);
    };
  },
  id: "open-stateful-set-scale-dialog",
});

export default openStatefulSetScaleDialogInjectable;
