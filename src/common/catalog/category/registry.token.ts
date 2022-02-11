/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { action, computed, observable } from "mobx";
import type { Disposer } from "../../utils";
import { getOrInsertMap, strictSet } from "../../utils";
import type { CatalogEntityData, CatalogEntityKindData, CatalogEntity } from "../entity";
import type { CatalogCategory } from "../category";

export type AddCatalogCategory = (category: CatalogCategory) => Disposer;
export type GetEntityForData = (data: CatalogEntityData & CatalogEntityKindData) => CatalogEntity | undefined;
export type Categories = IComputedValue<CatalogCategory[]>;
export type GetCategoryForEntity = (entity: CatalogEntity) => CatalogCategory | undefined;

export interface BaseCategoryActions {
  add: AddCatalogCategory;
  getCategoryForEntity: GetCategoryForEntity;
  getEntityForData: GetEntityForData;
  readonly categories: Categories;
}

export class BaseCatalogCategoryRegistry implements BaseCategoryActions {
  protected readonly categoriesSet = observable.set<CatalogCategory>();
  protected readonly groupKinds = new Map<string, Map<string, CatalogCategory>>();

  readonly categories = computed(() => [...this.categoriesSet]);

  @action
  add(category: CatalogCategory): Disposer {
    const byGroup = getOrInsertMap(this.groupKinds, category.spec.group);

    this.categoriesSet.add(category);
    strictSet(byGroup, category.spec.names.kind, category);

    return () => {
      this.categoriesSet.delete(category);
      byGroup.delete(category.spec.names.kind);
    };
  }

  getForGroupKind(group: string, kind: string): CatalogCategory | undefined {
    return this.groupKinds.get(group)?.get(kind);
  }

  getEntityForData(data: CatalogEntityData & CatalogEntityKindData): CatalogEntity | undefined {
    const category = this.getCategoryForEntity(data);

    if (!category) {
      return undefined;
    }

    const splitApiVersion = data.apiVersion.split("/");
    const version = splitApiVersion[1];

    const specVersion = category.spec.versions.find((v) => v.name === version);

    if (!specVersion) {
      return undefined;
    }

    return new specVersion.entityClass(data);
  }

  getCategoryForEntity(data: CatalogEntityData & CatalogEntityKindData): CatalogCategory | undefined {
    const splitApiVersion = data.apiVersion.split("/");
    const group = splitApiVersion[0];

    return this.getForGroupKind(group, data.kind);
  }

  getByName(name: string) {
    return this.categories.get().find(category => category.metadata?.name == name);
  }
}

export const catalogCategoryRegistryInjectionToken = getInjectionToken<BaseCatalogCategoryRegistry>({
  id: "catalog-category-registry-token",
});
