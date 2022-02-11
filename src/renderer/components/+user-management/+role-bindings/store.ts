/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RoleBinding, RoleBindingApi, RoleBindingSubject } from "../../../../common/k8s-api/endpoints";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { HashSet } from "../../../utils";
import { hashRoleBindingSubject } from "./hashers";

export class RoleBindingStore extends KubeObjectStore<RoleBinding, RoleBindingApi> {
  constructor(api: RoleBindingApi) {
    super(api);
  }

  protected sortItems(items: RoleBinding[]) {
    return super.sortItems(items, [
      roleBinding => roleBinding.kind,
      roleBinding => roleBinding.getName(),
    ]);
  }

  async updateSubjects(roleBinding: RoleBinding, subjects: RoleBindingSubject[]) {
    return this.update(roleBinding, {
      roleRef: roleBinding.roleRef,
      subjects,
    });
  }

  async removeSubjects(roleBinding: RoleBinding, subjectsToRemove: Iterable<RoleBindingSubject>) {
    const currentSubjects = new HashSet(roleBinding.getSubjects(), hashRoleBindingSubject);

    for (const subject of subjectsToRemove) {
      currentSubjects.delete(subject);
    }

    return this.updateSubjects(roleBinding, currentSubjects.toJSON());
  }
}
