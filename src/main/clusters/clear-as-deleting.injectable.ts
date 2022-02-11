/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../common/clusters/cluster-types";
import type { ClusterManager } from "./manager";
import clusterManagerInjectable from "./manager.injectable";

export type ClearAsDeleting = (clusterId: ClusterId) => void;

interface Dependencies {
  manager: ClusterManager;
}

const clearAsDeleting = ({ manager }: Dependencies): ClearAsDeleting => (
  (clusterId) => manager.clearAsDeleting(clusterId)
);

const clearAsDeletingInjectable = getInjectable({
  instantiate: (di) => clearAsDeleting({
    manager: di.inject(clusterManagerInjectable),
  }),
  id: "clear-as-deleting",
});

export default clearAsDeletingInjectable;
