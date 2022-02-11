/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import portForwardDialogStateInjectable from "./state.injectable";

const closePortForwardDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(portForwardDialogStateInjectable);

    return () => {
      state.set(undefined);
    };
  },
  id: "close-port-forward-dialog",
});

export default closePortForwardDialogInjectable;
