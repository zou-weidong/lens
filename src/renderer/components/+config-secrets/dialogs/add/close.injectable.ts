/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addSecretDialogStateInjectable from "./state.injectable";

const closeAddSecretDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(addSecretDialogStateInjectable);

    return () => {
      state.isOpen = false;
    };
  },
  id: "close-add-secret-dialog",
});

export default closeAddSecretDialogInjectable;
