/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import statefulSetScaleDialogStateInjectable from "./state.injectable";

const closeStatefulSetScaleDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(statefulSetScaleDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-stateful-set-scale-dialog",
});

export default closeStatefulSetScaleDialogInjectable;
