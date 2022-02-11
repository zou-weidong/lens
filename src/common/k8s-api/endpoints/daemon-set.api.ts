/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import get from "lodash/get";
import type { Affinity, Toleration } from "../common-types";
import { autoBind } from "../../utils";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { PodContainer, IPodMetrics } from "./pod.api";
import type { KubeObjectMetadata, LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";

export interface DaemonSetSpec {
  selector: LabelSelector;
  template: {
    metadata: {
      creationTimestamp?: string;
      labels: {
        name: string;
      };
    };
    spec: {
      containers: PodContainer[];
      initContainers?: PodContainer[];
      restartPolicy: string;
      terminationGracePeriodSeconds: number;
      dnsPolicy: string;
      hostPID: boolean;
      affinity?: Affinity;
      nodeSelector?: {
        [selector: string]: string;
      };
      securityContext: {};
      schedulerName: string;
      tolerations: Toleration[];
    };
  };
  updateStrategy: {
    type: string;
    rollingUpdate: {
      maxUnavailable: number;
    };
  };
  revisionHistoryLimit: number;
}

export interface DaemonSetStatus {
  currentNumberScheduled: number;
  numberMisscheduled: number;
  desiredNumberScheduled: number;
  numberReady: number;
  observedGeneration: number;
  updatedNumberScheduled: number;
  numberAvailable: number;
  numberUnavailable: number;
}

export class DaemonSet extends KubeObject<KubeObjectMetadata, DaemonSetStatus, DaemonSetSpec> {
  static kind = "DaemonSet";
  static namespaced = true;
  static apiBase = "/apis/apps/v1/daemonsets";

  constructor(data: KubeJsonApiData<KubeObjectMetadata, DaemonSetStatus, DaemonSetSpec>) {
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

  getImages() {
    const containers: PodContainer[] = get(this, "spec.template.spec.containers", []);
    const initContainers: PodContainer[] = get(this, "spec.template.spec.initContainers", []);

    return [...containers, ...initContainers].map(container => container.image);
  }
}

export class DaemonSetApi extends KubeApi<DaemonSet> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: DaemonSet,
      ...opts,
    });
  }
}

export function getMetricsForDaemonSets(daemonsets: DaemonSet[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = daemonsets.map(daemonset => `${daemonset.getName()}-[[:alnum:]]{5}`).join("|");
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
