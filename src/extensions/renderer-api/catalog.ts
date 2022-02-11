/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */


import type { CatalogEntity } from "../../common/catalog/entity";
import type { CatalogCategory } from "../../common/catalog/category";
import type { Disposer } from "../../common/utils";
import type { CatalogEntityOnBeforeRun } from "../../renderer/catalog/entity/registry";
import catalogEntityRegistryInjectable from "../../renderer/catalog/entity/registry.injectable";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";
import findEntityByIdInjectable from "../../common/catalog/entity/find-by-id.injectable";
import filterEntitiesByApiKindInjectable from "../../common/catalog/entity/filter-by-api-kind.injectable";

export interface CatalogEntityRegistry {
  /**
   * Currently active/visible entity
   */
  readonly activeEntity: CatalogEntity | undefined;

  /**
   * A map of all entities
   */
  readonly entities: Map<string, CatalogEntity>;

  /**
   * Get a specific entity by its ID
   * @param id The entity ID
   */
  getById(id: string): CatalogEntity | undefined;

  /**
   * Get all the entities for a specific version and kind
   */
  getItemsForApiKind(apiVersion: string, kind: string): CatalogEntity[];
  /**
   * @deprecated don't use the irrelavent type parameter
   */
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[];

  /**
   * Get all the entities for the kind and all the versions that a category declares
   */
  getItemsForCategory(category: CatalogCategory): CatalogEntity[];
  /**
   * @deprecated don't use the irrelavent type parameter
   */
  getItemsForCategory<T extends CatalogEntity>(category: CatalogCategory): T[];

  /**
   * Add a onBeforeRun hook to a catalog entities. If `onBeforeRun` was previously
   * added then it will not be added again.
   * @param onBeforeRun The function to be called with a `CatalogRunEvent`
   * event target will be the catalog entity. onBeforeRun hook can call event.preventDefault()
   * to stop run sequence
   * @returns A function to remove that hook
   */
  addOnBeforeRun(onBeforeRun: CatalogEntityOnBeforeRun): Disposer;
}

const _catalogEntities = asLegacyGlobalForExtensionApi(catalogEntityRegistryInjectable);
const findEntityById = asLegacyGlobalForExtensionApi(findEntityByIdInjectable);
const filterEntitiesByApiKind = asLegacyGlobalForExtensionApi(filterEntitiesByApiKindInjectable);

export const catalogEntities: CatalogEntityRegistry = {
  get activeEntity() {
    return _catalogEntities.activeEntity.get();
  },
  get entities() {
    return _catalogEntities.entityMap.get();
  },
  addOnBeforeRun(fn) {
    return _catalogEntities.addOnBeforeRun(fn);
  },
  getById: findEntityById,
  getItemsForApiKind: filterEntitiesByApiKind,
  getItemsForCategory(category: CatalogCategory) {
    return _catalogEntities.filterEntitiesByCategory(category);
  },
};
