/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, makeObservable } from "mobx";
import { KubeObjectStore } from "../../../../common/k8s-api/kube-object.store";
import { autoBind } from "../../../utils";
import type { CustomResourceDefinition, CustomResourceDefinitionApi } from "../../../../common/k8s-api/endpoints";
import type { KubeObject } from "../../../../common/k8s-api/kube-object";
import { groupBy } from "lodash";

export class CustomResourceDefinitionStore extends KubeObjectStore<CustomResourceDefinition, CustomResourceDefinitionApi> {
  constructor(api: CustomResourceDefinitionApi) {
    super(api);
    makeObservable(this);
    autoBind(this);
  }

  protected sortItems(items: CustomResourceDefinition[]) {
    return super.sortItems(items, [
      crd => crd.getGroup(),
      crd => crd.getName(),
    ]);
  }

  @computed get groups(): Record<string, CustomResourceDefinition[]> {
    return groupBy(this.items, crd => crd.getGroup());
  }

  getByGroup(group: string, pluralName: string) {
    return this.groups[group]?.find(crd => crd.getPluralName() === pluralName);
  }

  getByObject(obj: KubeObject) {
    if (!obj) return null;
    const { kind, apiVersion } = obj;

    return this.items.find(crd => (
      kind === crd.getResourceKind() && apiVersion === `${crd.getGroup()}/${crd.getVersion()}`
    ));
  }
}
