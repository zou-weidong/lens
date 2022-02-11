/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import get from "lodash/get";
import { autoBind } from "../../../renderer/utils";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { PodContainer, IPodMetrics, PodSpec } from "./pod.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { KubeObjectMetadata, LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { Affinity, Toleration } from "../common-types";

export class ReplicaSetApi extends KubeApi<ReplicaSet> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: ReplicaSet,
      ...opts,
    });
  }

  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.getUrl(params)}/scale`;
  }

  async getReplicas(params: { namespace: string; name: string }): Promise<number> {
    const { status } = await this.request.get(this.getScaleApiUrl(params)) as { status?: { replicas?: number }};

    return status?.replicas ?? 0;
  }

  scale(params: { namespace: string; name: string }, replicas: number) {
    return this.request.put(this.getScaleApiUrl(params), {
      data: {
        metadata: params,
        spec: {
          replicas,
        },
      },
    });
  }
}

export function getMetricsForReplicaSets(replicasets: ReplicaSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = replicasets.map(replicaset => `${replicaset.getName()}-[[:alnum:]]{5}`).join("|");
  const opts = { category: "pods", pods: podSelector, namespace, selector };

  return metricsApi.getMetrics({
    cpuUsage: opts,
    memoryUsage: opts,
    fsUsage: opts,
    fsWrites: opts,
    fsReads: opts,
    networkReceive: opts,
    networkTransmit: opts,
  }, {
    namespace,
  });
}

export interface ReplicaSetSpec {
  replicas?: number;
  selector: LabelSelector;
  template?: {
    metadata: {
      labels: {
        app: string;
      };
    };
    spec?: PodSpec;
  };
  minReadySeconds?: number;
}

export interface ReplicaSetStatus {
  replicas: number;
  fullyLabeledReplicas?: number;
  readyReplicas?: number;
  availableReplicas?: number;
  observedGeneration?: number;
  conditions?: {
    type: string;
    status: string;
    lastUpdateTime: string;
    lastTransitionTime: string;
    reason: string;
    message: string;
  }[];
}

export class ReplicaSet extends KubeObject<KubeObjectMetadata, ReplicaSetStatus, ReplicaSetSpec> {
  static kind = "ReplicaSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/replicasets";

  constructor(data: KubeJsonApiData<KubeObjectMetadata, ReplicaSetStatus, ReplicaSetSpec>) {
    super(data);
    autoBind(this);
  }

  getSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec?.selector?.matchLabels);
  }

  getNodeSelectors(): string[] {
    return KubeObject.stringifyLabels(this.spec?.template?.spec?.nodeSelector);
  }

  getTemplateLabels(): string[] {
    return KubeObject.stringifyLabels(this.spec?.template?.metadata?.labels);
  }

  getTolerations(): Toleration[] {
    return this.spec?.template?.spec?.tolerations ?? [];
  }

  getAffinity(): Affinity {
    return this.spec?.template?.spec?.affinity ?? {};
  }

  getAffinityNumber() {
    return Object.keys(this.getAffinity()).length;
  }

  getDesired() {
    return this.spec.replicas || 0;
  }

  getCurrent() {
    return this.status.availableReplicas || 0;
  }

  getReady() {
    return this.status.readyReplicas || 0;
  }

  getImages() {
    const containers: PodContainer[] = get(this, "spec.template.spec.containers", []);

    return [...containers].map(container => container.image);
  }
}
