/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../../logger/child-logger.injectable";

const catalogCategoryRegistryLoggerInjectable = getInjectable({
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "CATALOG-CATEGORY-REGISTRY",
  }),
  id: "catalog-category-registry-logger",
});

export default catalogCategoryRegistryLoggerInjectable;
