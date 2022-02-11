/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterDetector, K8sClusterRequest } from "./cluster-detector";
import { createHash } from "crypto";

async function getDefaultNamespaceId(k8sRequest: K8sClusterRequest) {
  const { metadata } = await k8sRequest("/api/v1/namespaces/default");
  const { uid } = metadata as { uid: string };

  return uid;
}

export const clusterIdDetector: ClusterDetector = async (cluster, { k8sRequest }) => {
  let id: string;

  try {
    id = await getDefaultNamespaceId(k8sRequest);
  } catch(_) {
    id = cluster.apiUrl;
  }
  const value = createHash("sha256").update(id).digest("hex");

  return { value, accuracy: 100 };
};
