/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { InjectionToken } from "@ogre-tools/injectable";
import { getInjectable } from "@ogre-tools/injectable";
import { catalogCategoryRegistryInjectionToken } from "../../../common/catalog/category/registry.token";
import { CatalogCategoryRegistry } from "./registry";

const catalogCategoryRegistryInjectable = getInjectable({
  instantiate: () => new CatalogCategoryRegistry(),
  injectionToken: catalogCategoryRegistryInjectionToken as InjectionToken<CatalogCategoryRegistry, void>,
  id: "catalog-category-registry",
});

export default catalogCategoryRegistryInjectable;
