/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createServiceAccountDialogStateInjectable from "./state.injectable";

const closeCreateServiceAccountDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(createServiceAccountDialogStateInjectable);

    return () => {
      state.set(false);
    };
  },
  id: "close-create-service-account-dialog",
});

export default closeCreateServiceAccountDialogInjectable;
