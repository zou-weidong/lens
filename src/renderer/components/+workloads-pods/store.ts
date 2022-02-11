/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import countBy from "lodash/countBy";
import { observable, makeObservable } from "mobx";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind, cpuUnitsToNumber, unitsToBytes } from "../../utils";
import type { Pod, PodMetrics, PodMetricsApi } from "../../../common/k8s-api/endpoints";
import type { KubeApi } from "../../../common/k8s-api/kube-api";
import type { KubeObject } from "../../../common/k8s-api/kube-object";

interface Dependencies {
  readonly podMetricsApi: PodMetricsApi;
}

export class PodStore extends KubeObjectStore<Pod> {
  @observable kubeMetrics = observable.array<PodMetrics>([]);

  constructor(protected readonly dependencies: Dependencies, api: KubeApi<Pod>) {
    super(api);
    makeObservable(this);
    autoBind(this);
  }

  async loadKubeMetrics(namespace?: string) {
    try {
      this.kubeMetrics.replace(await this.dependencies.podMetricsApi.list({ namespace }));
    } catch (error) {
      console.warn("loadKubeMetrics failed", error);
    }
  }

  getPodsByOwner(workload: KubeObject): Pod[] {
    if (!workload) return [];

    return this.items
      .filter(pod => (
        pod.getOwnerRefs()
          .findIndex(owner => owner.uid === workload.getId())
        >= 0
      ));
  }

  getPodsByOwnerId(workloadId: string): Pod[] {
    return this.items.filter(pod => {
      return pod.getOwnerRefs().find(owner => owner.uid === workloadId);
    });
  }

  getPodsByNode(node: string) {
    if (!this.isLoaded) return [];

    return this.items.filter(pod => pod.spec.nodeName === node);
  }

  getStatuses(pods: Pod[]) {
    return countBy(pods.map(pod => pod.getStatus()).sort().reverse());
  }

  getPodKubeMetrics(pod: Pod) {
    const containers = pod.getContainers();
    const empty = { cpu: 0, memory: 0 };
    const metrics = this.kubeMetrics.find(metric => {
      return [
        metric.getName() === pod.getName(),
        metric.getNs() === pod.getNs(),
      ].every(v => v);
    });

    if (!metrics) return empty;

    return containers.reduce((total, container) => {
      const metric = metrics.containers.find(item => item.name == container.name);
      let cpu = "0";
      let memory = "0";

      if (metric && metric.usage) {
        cpu = metric.usage.cpu || "0";
        memory = metric.usage.memory || "0";
      }

      return {
        cpu: total.cpu + cpuUnitsToNumber(cpu),
        memory: total.memory + unitsToBytes(memory),
      };
    }, empty);
  }
}
