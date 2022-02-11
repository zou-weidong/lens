/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeResource } from "../../../common/k8s/resources";
import { resourceNames } from "../../../common/k8s/resources";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import allowedResourcesInjectable from "../../clusters/allowed-resources.injectable";
import namespaceStoreInjectable from "../+namespaces/namespace-store/namespace-store.injectable";
import replicaSetStoreInjectable from "../+workloads-replicasets/store.injectable";
import { computed } from "mobx";
import { workloadURL } from "../../../common/routes";
import { iter } from "../../utils";
import type { NamespaceStore } from "../+namespaces/namespace-store/namespace.store";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";
import statefulSetStoreInjectable from "../+workloads-statefulsets/store.injectable";
import cronJobStoreInjectable from "../+workloads-cronjobs/store.injectable";
import daemonSetStoreInjectable from "../+workloads-daemonsets/store.injectable";
import deploymentStoreInjectable from "../+workloads-deployments/store.injectable";
import jobStoreInjectable from "../+workloads-jobs/store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";

interface Dependencies {
  workloadStores: Map<KubeResource, KubeObjectStore<KubeObject>>;
  allowedResources: AllowedResources;
  namespaceStore: NamespaceStore;
}

const workloads = ({
  workloadStores,
  allowedResources,
  namespaceStore,
}: Dependencies) => computed(() => Array.from(
  iter.filter(
    workloadStores.entries(),
    ([resource]) => allowedResources.has(resource),
  ),
  ([resource, store]) => {
    const items = store.getAllByNs(namespaceStore.contextNamespaces);

    return {
      resource,
      href: workloadURL[resource](),
      amountOfItems: items.length,
      status: store.getStatuses(items),
      title: resourceNames[resource],
    };
  },
));

const workloadsInjectable = getInjectable({
  instantiate: (di) =>
    workloads({
      allowedResources: di.inject(allowedResourcesInjectable),
      namespaceStore: di.inject(namespaceStoreInjectable),
      workloadStores: new Map<KubeResource, KubeObjectStore<KubeObject>>([
        ["pods", di.inject(podStoreInjectable)],
        ["deployments", di.inject(deploymentStoreInjectable)],
        ["daemonsets", di.inject(daemonSetStoreInjectable)],
        ["statefulsets", di.inject(statefulSetStoreInjectable)],
        ["replicasets", di.inject(replicaSetStoreInjectable)],
        ["jobs", di.inject(jobStoreInjectable)],
        ["cronjobs", di.inject(cronJobStoreInjectable)],
      ]),
    }),
  id: "workloads",
});

export default workloadsInjectable;
