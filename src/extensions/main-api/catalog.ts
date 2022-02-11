/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntity } from "../../common/catalog/entity";
import filterEntitiesByApiKindInjectable from "../../common/catalog/entity/filter-by-api-kind.injectable";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";

export interface CatalogEntityRegistry {
  getItemsForApiKind(apiVersion: string, kind: string): CatalogEntity[];
  /**
   * @deprecated don't use the unused type parameter
   */
  getItemsForApiKind<T extends CatalogEntity>(apiVersion: string, kind: string): T[];
}

export const catalogEntities: CatalogEntityRegistry = {
  getItemsForApiKind: asLegacyGlobalForExtensionApi(filterEntitiesByApiKindInjectable),
};
