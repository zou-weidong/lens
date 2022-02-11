/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../../common/clusters/cluster";
import type { ClusterDetectionResult } from "./cluster-detector";
import clusterMetadataDetectorRegistryInjectable from "./detector-registry.injectable";

export type DetectSpecificForCluster = (cluster: Cluster, key: string) => Promise<ClusterDetectionResult>;

const detectSpecificMetadataForClusterInjectable = getInjectable({
  instantiate: (di): DetectSpecificForCluster => {
    const registry = di.inject(clusterMetadataDetectorRegistryInjectable);

    return (cluster, key) => registry.detectSpecificForCluster(cluster, key);
  },
  id: "detect-specific-for-cluster",
});

export default detectSpecificMetadataForClusterInjectable;
