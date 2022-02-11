/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { CatalogEntityStore } from "./catalog-entity.store";
import catalogEntityRegistryInjectable from "../../../catalog/entity/registry.injectable";
import catalogCategoryRegistryInjectable from "../../../catalog/category/registry.injectable";

const catalogEntityStoreInjectable = getInjectable({
  id: "catalog-entity-store",

  instantiate: (di) => new CatalogEntityStore({
    entityRegistry: di.inject(catalogEntityRegistryInjectable),
    categoryRegistry: di.inject(catalogCategoryRegistryInjectable),
  }),
});

export default catalogEntityStoreInjectable;
