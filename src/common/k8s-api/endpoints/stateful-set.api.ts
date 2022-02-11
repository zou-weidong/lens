/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Affinity, Toleration } from "../common-types";
import { autoBind } from "../../utils";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { IPodMetrics } from "./pod.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { KubeObjectMetadata, LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";

export class StatefulSetApi extends KubeApi<StatefulSet> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: StatefulSet,
      ...opts,
    });
  }

  protected getScaleApiUrl(params: { namespace: string; name: string }) {
    return `${this.getUrl(params)}/scale`;
  }

  getReplicas(params: { namespace: string; name: string }): Promise<number> {
    return this.request
      .get(this.getScaleApiUrl(params))
      .then(({ status }: any) => status?.replicas);
  }

  scale(params: { namespace: string; name: string }, replicas: number) {
    return this.request.patch(this.getScaleApiUrl(params), {
      data: {
        spec: {
          replicas,
        },
      },
    },
    {
      headers: {
        "content-type": "application/merge-patch+json",
      },
    });
  }
}

export function getMetricsForStatefulSets(statefulSets: StatefulSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = statefulSets.map(statefulset => `${statefulset.getName()}-[[:digit:]]+`).join("|");
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

export interface StatefulSetSpec {
  serviceName: string;
  replicas: number;
  selector: LabelSelector;
  template: {
    metadata: {
      labels: {
        app: string;
      };
    };
    spec: {
      containers: null | {
        name: string;
        image: string;
        ports: {
          containerPort: number;
          name: string;
        }[];
        volumeMounts: {
          name: string;
          mountPath: string;
        }[];
      }[];
      affinity?: Affinity;
      nodeSelector?: {
        [selector: string]: string;
      };
      tolerations: Toleration[];
    };
  };
  volumeClaimTemplates: {
    metadata: {
      name: string;
    };
    spec: {
      accessModes: string[];
      resources: {
        requests: {
          storage: string;
        };
      };
    };
  }[];
}

export interface StatefulSetStatus {
  observedGeneration: number;
  replicas: number;
  currentReplicas: number;
  readyReplicas: number;
  currentRevision: string;
  updateRevision: string;
  collisionCount: number;
}

export class StatefulSet extends KubeObject<KubeObjectMetadata, StatefulSetStatus, StatefulSetSpec> {
  static kind = "StatefulSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/statefulsets";

  constructor(data: KubeJsonApiData<KubeObjectMetadata, StatefulSetStatus, StatefulSetSpec>) {
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

  getReplicas() {
    return this.spec.replicas || 0;
  }

  getImages() {
    const containers = this.spec.template?.spec?.containers ?? [];

    return containers.map(container => container.image);
  }
}
