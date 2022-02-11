/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterDetector, K8sClusterRequest } from "./cluster-detector";

async function getNodeCount(k8sRequest: K8sClusterRequest) {
  const { items } = await k8sRequest("/api/v1/nodes");

  return (items as any[]).length;
}

export const nodesCountDetector: ClusterDetector = async (cluster, { k8sRequest }) => {
  if (!cluster.accessible) {
    return null;
  }

  return {
    value: await getNodeCount(k8sRequest),
    accuracy: 100,
  };
};

