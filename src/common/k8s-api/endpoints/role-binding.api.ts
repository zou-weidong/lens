/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";

export type RoleBindingSubjectKind = "Group" | "ServiceAccount" | "User";

export interface RoleBindingSubject {
  kind: RoleBindingSubjectKind;
  name: string;
  namespace?: string;
  apiGroup?: string;
}

export interface RoleRef {
  kind: string;
  name: string;
  apiGroup?: string;
}

export class RoleBinding extends KubeObject {
  static kind = "RoleBinding";
  static namespaced = true;
  static apiBase = "/apis/rbac.authorization.k8s.io/v1/rolebindings";

  declare subjects?: RoleBindingSubject[];
  declare roleRef?: RoleRef;

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  getSubjects() {
    return this.subjects || [];
  }

  getSubjectNames(): string {
    return this.getSubjects().map(subject => subject.name).join(", ");
  }
}

export class RoleBindingApi extends KubeApi<RoleBinding> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: RoleBinding,
    });
  }
}
