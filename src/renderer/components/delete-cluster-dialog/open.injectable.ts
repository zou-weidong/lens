/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DeleteClusterDialogState } from "./state.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import deleteClusterDialogStateInjectable from "./state.injectable";

export type OpenDeleteClusterDialog = (params: DeleteClusterDialogState) => void;

const openDeleteClusterDialogInjectable = getInjectable({
  instantiate: (di): OpenDeleteClusterDialog => {
    const state = di.inject(deleteClusterDialogStateInjectable);

    return (params) => {
      state.set(params);
    };
  },
  id: "open-delete-cluster-dialog",
});

export default openDeleteClusterDialogInjectable;

