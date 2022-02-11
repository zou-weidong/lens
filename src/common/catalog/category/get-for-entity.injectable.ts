/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { catalogCategoryRegistryInjectionToken, GetCategoryForEntity } from "./registry.token";

const getCategoryForEntityInjectable = getInjectable({
  instantiate: (di): GetCategoryForEntity => {
    const registry = di.inject(catalogCategoryRegistryInjectionToken);

    return (entity) => registry.getCategoryForEntity(entity);
  },
  id: "get-category-for-entity",
});

export default getCategoryForEntityInjectable;

