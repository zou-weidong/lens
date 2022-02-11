/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable } from "mobx";
import type { ClusterMetadata } from "../../../common/clusters/cluster-types";
import type { Cluster } from "../../../common/clusters/cluster";
import { iter } from "../../../common/utils";
import type { K8sRequest } from "../../k8s-api/request.injectable";
import type { ClusterDetectionResult, ClusterDetector, ClusterDetectorDependencies } from "./cluster-detector";

export interface DetectorRegistryDependencies {
  k8sRequest: K8sRequest;
}

export class DetectorRegistry {
  private detectors = observable.map<string, ClusterDetector>([], { deep: false });

  constructor(protected readonly dependencies: DetectorRegistryDependencies) {}

  add(key: string, detectorClass: ClusterDetector): void {
    this.detectors.set(key, detectorClass);
  }

  private getDetectorDeps(cluster: Cluster): ClusterDetectorDependencies {
    return {
      k8sRequest: (path, opts) => this.dependencies.k8sRequest(cluster, path, opts),
    };
  }

  detectSpecificForCluster(cluster: Cluster, key: string): Promise<ClusterDetectionResult> {
    const detector = this.detectors.get(key);

    if (!detector) {
      throw new Error(`No detector registered under ${key}`);
    }

    return detector(cluster, this.getDetectorDeps(cluster));
  }

  async detectForCluster(cluster: Cluster): Promise<ClusterMetadata> {
    const results = new Map<string, ClusterDetectionResult>();

    for (const [key, detector] of this.detectors) {
      try {
        const data = await detector(cluster, this.getDetectorDeps(cluster));

        if (!data) {
          continue;
        }

        if (results.has(key)) {
          const prevResult = results.get(key);

          if (prevResult.accuracy <= data.accuracy) {
            // only save the new value if it is more accurate than the previous
            results.set(key, data);
          }
        } else {
          results.set(key, data);
        }
      } catch (e) {
        // detector raised error, do nothing
      }
    }

    return Object.fromEntries(iter.map(results, ([key, { value }]) => [key, value]));
  }
}
