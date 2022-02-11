/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { AddCatalogCategory, catalogCategoryRegistryInjectionToken } from "./registry.token";

const addCatalogCategoryInjectable = getInjectable({
  instantiate: (di): AddCatalogCategory => {
    const registry = di.inject(catalogCategoryRegistryInjectionToken);

    return (category) => registry.add(category);
  },
  id: "add-catalog-category",
});

export default addCatalogCategoryInjectable;

