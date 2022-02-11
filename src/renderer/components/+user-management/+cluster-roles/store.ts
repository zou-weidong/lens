/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { ClusterRole, ClusterRoleApi } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../../utils";

export class ClusterRoleStore extends KubeObjectStore<ClusterRole, ClusterRoleApi> {
  constructor(api: ClusterRoleApi) {
    super(api);
    autoBind(this);
  }

  protected sortItems(items: ClusterRole[]) {
    return super.sortItems(items, [
      clusterRole => clusterRole.kind,
      clusterRole => clusterRole.getName(),
    ]);
  }
}
