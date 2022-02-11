/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import get from "lodash/get";
import { autoBind } from "../../utils";
import type { Affinity, Toleration } from "../common-types";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { metricsApi } from "./metrics.api";
import type { KubeJsonApiData } from "../kube-json-api";
import type { PodContainer, IPodMetrics } from "./pod.api";
import type { KubeObjectMetadata, LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";

export interface JobSpec {
  parallelism?: number;
  completions?: number;
  backoffLimit?: number;
  selector?: LabelSelector;
  template: {
    metadata: {
      creationTimestamp?: string;
      labels?: Partial<Record<string, string>>;
      annotations?: Partial<Record<string, string>>;
    };
    spec: {
      containers: PodContainer[];
      restartPolicy: string;
      terminationGracePeriodSeconds: number;
      dnsPolicy: string;
      hostPID: boolean;
      affinity?: Affinity;
      nodeSelector?: Partial<Record<string, string>>;
      tolerations?: Toleration[];
      schedulerName: string;
    };
  };
  containers?: PodContainer[];
  restartPolicy?: string;
  terminationGracePeriodSeconds?: number;
  dnsPolicy?: string;
  serviceAccountName?: string;
  serviceAccount?: string;
  schedulerName?: string;
}

export interface JobStatus {
  conditions: {
    type: string;
    status: string;
    lastProbeTime: string;
    lastTransitionTime: string;
    message?: string;
  }[];
  startTime: string;
  completionTime: string;
  succeeded: number;
}

export class Job extends KubeObject<KubeObjectMetadata, JobStatus, JobSpec> {
  static kind = "Job";
  static namespaced = true;
  static apiBase = "/apis/batch/v1/jobs";

  constructor(data: KubeJsonApiData<KubeObjectMetadata, JobStatus, JobSpec>) {
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

  getDesiredCompletions() {
    return this.spec.completions || 0;
  }

  getCompletions() {
    return this.status.succeeded || 0;
  }

  getParallelism() {
    return this.spec.parallelism || 1;
  }

  getCondition() {
    // Type of Job condition could be only Complete or Failed
    // https://kubernetes.io/docs/reference/generated/kubernetes-api/v1.14/#jobcondition-v1-batch
    return this.status.conditions?.find(({ status }) => status === "True");
  }

  getImages() {
    const containers: PodContainer[] = get(this, "spec.template.spec.containers", []);

    return [...containers].map(container => container.image);
  }
}

export class JobApi extends KubeApi<Job> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: Job,
      ...opts,
    });
  }
}

export function getMetricsForJobs(jobs: Job[], namespace: string, selector = ""): Promise<IPodMetrics> {
  const podSelector = jobs.map(job => `${job.getName()}-[[:alnum:]]{5}`).join("|");
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
