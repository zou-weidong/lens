/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { comparer, computed } from "mobx";
import type { KubeResource } from "../../common/k8s/resources";
import hostedClusterInjectable from "./hosted-cluster.injectable";

export interface AllowedResources {
  has: (resource: KubeResource) => boolean;
}

const allowedResourcesInjectable = getInjectable({
  instantiate: (di): AllowedResources => {
    const cluster = di.inject(hostedClusterInjectable);
    const allowedResources = computed(() => new Set(cluster.allowedResources), {
      // This needs to be here so that during refresh changes are only propogated when necessary
      equals: (cur, prev) => comparer.structural(cur, prev),
    });

    return {
      has: (resource) => allowedResources.get().has(resource),
    };
  },
  id: "allowed-resources",
  lifecycle: lifecycleEnum.transient,
});

export default allowedResourcesInjectable;
