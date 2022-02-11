/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";
import type { RoleRef } from "./role-binding.api";

export type ClusterRoleBindingSubjectKind = "Group" | "ServiceAccount" | "User";

export interface ClusterRoleBindingSubject {
  kind: ClusterRoleBindingSubjectKind;
  name: string;
  apiGroup?: string;
  namespace?: string;
}

export class ClusterRoleBinding extends KubeObject {
  static kind = "ClusterRoleBinding";
  static namespaced = false;
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/clusterrolebindings";

  declare subjects?: ClusterRoleBindingSubject[];
  declare roleRef?: RoleRef;

  getSubjects() {
    return this.subjects || [];
  }

  getSubjectNames(): string {
    return this.getSubjects().map(subject => subject.name).join(", ");
  }
}

export class ClusterRoleBindingApi extends KubeApi<ClusterRoleBinding> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: ClusterRoleBinding,
    });
  }
}
