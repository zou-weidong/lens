/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import moment from "moment";

import type { Affinity, Toleration } from "../common-types";
import { autoBind } from "../../utils";
import type { DerivedKubeApiOptions, IgnoredKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { IPodMetrics } from "./pod.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { KubeObjectMetadata, LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { PodSpec } from ".";

export class DeploymentApi extends KubeApi<Deployment> {
  constructor(opts: DerivedKubeApiOptions & IgnoredKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: Deployment,
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

  restart(params: { namespace: string; name: string }) {
    return this.request.patch(this.getUrl(params), {
      data: {
        spec: {
          template: {
            metadata: {
              annotations: { "kubectl.kubernetes.io/restartedAt" : moment.utc().format() },
            },
          },
        },
      },
    },
    {
      headers: {
        "content-type": "application/strategic-merge-patch+json",
      },
    });
  }
}

export function getMetricsForDeployments(deployments: Deployment[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = deployments.map(deployment => `${deployment.getName()}-[[:alnum:]]{9,}-[[:alnum:]]{5}`).join("|");
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

export interface DeploymentSpec {
  replicas: number;
  selector: LabelSelector;
  template: {
    metadata: KubeObjectMetadata;
    spec: PodSpec;
  };
  strategy: {
    type: string;
    rollingUpdate: {
      maxUnavailable: number;
      maxSurge: number;
    };
  };
}

export interface DeploymentStatus {
  observedGeneration: number;
  replicas: number;
  updatedReplicas: number;
  readyReplicas: number;
  availableReplicas?: number;
  unavailableReplicas?: number;
  conditions: {
    type: string;
    status: string;
    lastUpdateTime: string;
    lastTransitionTime: string;
    reason: string;
    message: string;
  }[];
}

export class Deployment extends KubeObject<KubeObjectMetadata, DeploymentStatus, DeploymentSpec> {
  static kind = "Deployment";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/deployments";

  constructor(data: KubeJsonApiData<KubeObjectMetadata, DeploymentStatus, DeploymentSpec>) {
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

  getConditions(activeOnly = false) {
    const { conditions } = this.status;

    if (!conditions) return [];

    if (activeOnly) {
      return conditions.filter(c => c.status === "True");
    }

    return conditions;
  }

  getConditionsText(activeOnly = true) {
    return this.getConditions(activeOnly).map(({ type }) => type).join(" ");
  }

  getReplicas() {
    return this.spec.replicas || 0;
  }
}
