/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeObjectMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";
import { autoBind } from "../../../renderer/utils";
import { metricsApi } from "./metrics.api";
import type { IPodMetrics } from "./pod.api";
import type { KubeJsonApiData } from "../kube-json-api";

export type NamespaceStatusPhase = "Active" | "Terminating";

export interface NamespaceStatus {
  phase: NamespaceStatusPhase;
}

export interface NamespaceSpec {
  finalizers?: string[];
}

export class Namespace extends KubeObject<KubeObjectMetadata, NamespaceStatus, NamespaceSpec> {
  static kind = "Namespace";
  static namespaced = false;
  static apiBase = "/api/v1/namespaces";

  constructor(data: KubeJsonApiData<KubeObjectMetadata, NamespaceStatus, NamespaceSpec>) {
    super(data);
    autoBind(this);
  }

  getStatus() {
    return this.status?.phase ?? "-";
  }
}

export class NamespaceApi extends KubeApi<Namespace> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: Namespace,
    });
  }
}

export function getMetricsForNamespace(namespace: string, selector = ""): Promise<IPodMetrics> {
  const opts = { category: "pods", pods: ".*", namespace, selector };

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
