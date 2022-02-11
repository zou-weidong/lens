/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { makeObservable } from "mobx";
import type { PodStore } from "../+workloads-pods/store";

import type { Deployment, DeploymentApi } from "../../../common/k8s-api/endpoints";
import { PodStatusKind } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";

interface Dependencies {
  readonly podStore: PodStore;
}

export class DeploymentStore extends KubeObjectStore<Deployment, DeploymentApi> {
  constructor(protected readonly dependencies: Dependencies, api: DeploymentApi) {
    super(api);
    makeObservable(this);
    autoBind(this);
  }

  protected sortItems(items: Deployment[]) {
    return super.sortItems(items, [
      item => item.getReplicas(),
    ], "desc");
  }

  getStatuses(deployments?: Deployment[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    deployments.forEach(deployment => {
      const pods = this.getChildPods(deployment);

      if (pods.some(pod => pod.getStatus() === PodStatusKind.FAILED)) {
        status.failed++;
      }
      else if (pods.some(pod => pod.getStatus() === PodStatusKind.PENDING)) {
        status.pending++;
      }
      else {
        status.running++;
      }
    });

    return status;
  }

  getChildPods(deployment: Deployment) {
    return this.dependencies.podStore
      .getByLabel(deployment.getTemplateLabels())
      .filter(pod => pod.getNs() === deployment.getNs());
  }
}
