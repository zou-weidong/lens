/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../utils";
import type { Job, JobApi, CronJob, Pod } from "../../../common/k8s-api/endpoints";
import { PodStatusKind } from "../../../common/k8s-api/endpoints";
import type { PodStore } from "../+workloads-pods/store";

interface Dependencies {
  readonly podStore: PodStore;
}

export class JobStore extends KubeObjectStore<Job, JobApi> {
  constructor(protected readonly dependencies: Dependencies, api: JobApi) {
    super(api);
    autoBind(this);
  }

  getChildPods(job: Job): Pod[] {
    return this.dependencies.podStore.getPodsByOwnerId(job.getId());
  }

  getJobsByOwner(cronJob: CronJob) {
    return this.items.filter(job =>
      job.getNs() == cronJob.getNs() &&
      job.getOwnerRefs().find(ref => ref.name === cronJob.getName() && ref.kind === cronJob.kind),
    );
  }

  getStatuses(jobs?: Job[]) {
    const status = { succeeded: 0, running: 0, failed: 0, pending: 0 };

    jobs.forEach(job => {
      const pods = this.getChildPods(job);

      if (pods.some(pod => pod.getStatus() === PodStatusKind.FAILED)) {
        status.failed++;
      }
      else if (pods.some(pod => pod.getStatus() === PodStatusKind.PENDING)) {
        status.pending++;
      }
      else if (pods.some(pod => pod.getStatus() === PodStatusKind.RUNNING)) {
        status.running++;
      }
      else {
        status.succeeded++;
      }
    });

    return status;
  }
}
