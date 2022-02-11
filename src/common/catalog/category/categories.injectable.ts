/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { catalogCategoryRegistryInjectionToken } from "./registry.token";

const categoriesInjectable = getInjectable({
  instantiate: (di) => di.inject(catalogCategoryRegistryInjectionToken).categories,
  id: "categories",
});

export default categoriesInjectable;

