/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { ClusterId } from "../clusters/cluster-types";
import type { KubeJsonApi } from "./kube-json-api";

export type KubeJsonApiForCluster = (clusterId: ClusterId) => KubeJsonApi;

export const kubeJsonApiForClusterInjectionToken = getInjectionToken<KubeJsonApiForCluster>({
  id: "kube-json-api-for-cluster-token",
});
