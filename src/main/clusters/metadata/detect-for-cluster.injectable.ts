/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterMetadata } from "../../../common/clusters/cluster-types";
import type { Cluster } from "../../../common/clusters/cluster";
import { getInjectable } from "@ogre-tools/injectable";
import clusterMetadataDetectorRegistryInjectable from "./detector-registry.injectable";

export type DetectMetadataForCluster = (cluster: Cluster) => Promise<ClusterMetadata>;

const detectMetadataForClusterInjectable = getInjectable({
  instantiate: (di): DetectMetadataForCluster => {
    const registry = di.inject(clusterMetadataDetectorRegistryInjectable);

    return (cluster) => registry.detectForCluster(cluster);
  },
  id: "detect-metadata-for-cluster",
});

export default detectMetadataForClusterInjectable;

