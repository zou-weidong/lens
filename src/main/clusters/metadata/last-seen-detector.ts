/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterDetector } from "./cluster-detector";

export const lastSeenDetector: ClusterDetector = async (cluster, { k8sRequest }) => {
  if (!cluster.accessible) {
    return null;
  }

  await k8sRequest("/version");

  return { value: new Date().toJSON(), accuracy: 100 };
};
