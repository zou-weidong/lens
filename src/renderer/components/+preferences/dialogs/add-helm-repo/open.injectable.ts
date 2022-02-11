/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import addHelmRepoDialogStateInjectable from "./state.injectable";

const openAddHelmRepoDialogInjectable = getInjectable({
  instantiate: (di) => {
    const state = di.inject(addHelmRepoDialogStateInjectable);

    return () => {
      state.isOpen = true;
    };
  },
  id: "open-add-helm-repo-dialog",
});

export default openAddHelmRepoDialogInjectable;
