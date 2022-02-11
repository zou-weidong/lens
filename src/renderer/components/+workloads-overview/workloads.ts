/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { computed } from "mobx";
import type { KubeResource } from "../../../common/k8s/resources";
import { resourceNames } from "../../../common/k8s/resources";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { workloadURL } from "../../../common/routes";
import type { NamespaceStore } from "../+namespaces/namespace-store/namespace.store";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";

interface Dependencies {
  workloadStores: Map<KubeResource, KubeObjectStore<KubeObject>>;
  allowedResources: AllowedResources;
  namespaceStore: NamespaceStore;
}

export const workloads = ({
  workloadStores,
  allowedResources,
  namespaceStore,
}: Dependencies) =>
  computed(() =>
    [...workloadStores.entries()]
      .filter(([resource]) => allowedResources.has(resource))
      .map(([resource, store]) => {
        const items = store.getAllByNs(namespaceStore.contextNamespaces);

        return {
          resource,
          href: workloadURL[resource](),
          amountOfItems: items.length,
          status: store.getStatuses(items),
          title: resourceNames[resource],
        };
      }),
  );
