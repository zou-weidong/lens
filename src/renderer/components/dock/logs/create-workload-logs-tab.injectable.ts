/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PodStore } from "../../+workloads-pods/store";
import podStoreInjectable from "../../+workloads-pods/store.injectable";
import type { DaemonSet, Deployment, Job, Pod, ReplicaSet, StatefulSet } from "../../../../common/k8s-api/endpoints";
import type { TabId } from "../dock/store";
import type { CreateLogsTabData } from "./create-logs-tab.injectable";
import createLogsTabInjectable from "./create-logs-tab.injectable";

export interface WorkloadLogsTabData {
  workload: DaemonSet | Deployment | Job | Pod | ReplicaSet | StatefulSet;
}

interface Dependencies {
  createLogsTab: (title: string, data: CreateLogsTabData) => TabId;
  podStore: PodStore;
}

const createWorkloadLogsTab = ({
  createLogsTab,
  podStore,
}: Dependencies) => ({ workload }: WorkloadLogsTabData): TabId | undefined => {
  const [selectedPod] = podStore.getPodsByOwnerId(workload.getId());

  if (!selectedPod) {
    return undefined;
  }

  return createLogsTab(`${workload.kind} ${selectedPod.getName()}`, {
    selectedContainer: selectedPod.getAllContainers()[0].name,
    selectedPodId: selectedPod.getId(),
    namespace: selectedPod.getNs(),
    owner: {
      kind: workload.kind,
      name: workload.getName(),
      uid: workload.getId(),
    },
  });
};

const createWorkloadLogsTabInjectable = getInjectable({
  id: "create-workload-logs-tab",

  instantiate: (di) => createWorkloadLogsTab({
    createLogsTab: di.inject(createLogsTabInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});

export default createWorkloadLogsTabInjectable;
