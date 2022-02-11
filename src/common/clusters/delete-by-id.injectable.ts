/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "./cluster-types";
import { clusterStoreInjectionToken } from "./store-injection-token";

export type DeleteClusterById = (id: ClusterId) => void;

const deleteClusterByIdInjectable = getInjectable({
  instantiate: (di): DeleteClusterById => {
    const store = di.inject(clusterStoreInjectionToken);

    return (id) => store.deleteById(id);
  },
  id: "delete-cluster-by-id",
});

export default deleteClusterByIdInjectable;
