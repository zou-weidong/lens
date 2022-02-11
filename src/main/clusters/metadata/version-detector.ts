/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterDetector } from "./cluster-detector";

export const versionDetector: ClusterDetector = async (cluster, { k8sRequest }) => {
  const { gitVersion } = await k8sRequest("/version");

  return {
    value: gitVersion as string,
    accuracy: 100,
  };
};

