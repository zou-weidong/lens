/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createServiceAccountDialogStateInjectable from "./state.injectable";

const openCreateServiceAccountDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(createServiceAccountDialogStateInjectable);

    return () => {
      state.set(true);
    };
  },
  id: "open-create-service-account-dialog",
});

export default openCreateServiceAccountDialogInjectable;
