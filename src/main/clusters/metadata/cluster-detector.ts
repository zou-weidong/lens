/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequestPromiseOptions } from "request-promise-native";
import type { JsonObject } from "type-fest";
import type { Cluster } from "../../../common/clusters/cluster";

export interface ClusterDetectionResult {
  value: string | number | boolean
  accuracy: number
}

export type K8sClusterRequest = (path: string, options?: RequestPromiseOptions) => Promise<JsonObject>;

export interface ClusterDetectorDependencies {
  k8sRequest: K8sClusterRequest;
}

export type ClusterDetector = (cluster: Cluster, deps: ClusterDetectorDependencies) => Promise<ClusterDetectionResult | undefined>;
