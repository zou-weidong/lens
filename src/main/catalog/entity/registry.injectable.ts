/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { catalogEntityRegistryInjectionToken } from "../../../common/catalog/entity/registry.token";
import catalogCategoryRegistryInjectable from "../category/registry.injectable";
import { CatalogEntityRegistry } from "./registry";

const catalogEntityRegistryInjectable = getInjectable({
  instantiate: (di) => new CatalogEntityRegistry({
    categoryRegistry: di.inject(catalogCategoryRegistryInjectable),
  }),
  injectionToken: catalogEntityRegistryInjectionToken as InjectionToken<CatalogEntityRegistry, void>,
  id: "catalog-entity-registry",
});

export default catalogEntityRegistryInjectable;
