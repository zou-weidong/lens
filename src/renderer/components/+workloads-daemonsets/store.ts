/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { makeObservable } from "mobx";
import type { PodStore } from "../+workloads-pods/store";

import type { DaemonSet, DaemonSetApi, Pod } from "../../../common/k8s-api/endpoints";
import { PodStatusKind } from "../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";

interface Dependencies {
  readonly podStore: PodStore;
}

export class DaemonSetStore extends KubeObjectStore<DaemonSet, DaemonSetApi> {
  constructor(protected readonly dependencies: Dependencies, api: DaemonSetApi) {
    super(api);
    makeObservable(this);
    autoBind(this);
  }

  getChildPods(daemonSet: DaemonSet): Pod[] {
    return this.dependencies.podStore.getPodsByOwnerId(daemonSet.getId());
  }

  getStatuses(daemonSets?: DaemonSet[]) {
    const status = { running: 0, failed: 0, pending: 0 };

    daemonSets.forEach(daemonSet => {
      const pods = this.getChildPods(daemonSet);

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
}
