/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeObjectMetadata, LabelSelector } from "../kube-object";
import { KubeObject } from "../kube-object";
import type { RoleRule } from "./role.api";

export interface AggregationRule {
  clusterRoleSelectors?: LabelSelector[];
}

export class ClusterRole extends KubeObject<KubeObjectMetadata, undefined, undefined> {
  static kind = "ClusterRole";
  static namespaced = false;
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/clusterroles";

  declare rules?: RoleRule[];
  declare aggregationRule?: AggregationRule;

  getRules() {
    return this.rules || [];
  }
}

export class ClusterRoleApi extends KubeApi<ClusterRole> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: ClusterRole,
    });
  }
}
