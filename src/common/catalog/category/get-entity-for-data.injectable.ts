/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { GetEntityForData } from "./registry.token";
import { catalogCategoryRegistryInjectionToken } from "./registry.token";

const getEntityForDataInjectable = getInjectable({
  instantiate: (di): GetEntityForData => {
    const registry = di.inject(catalogCategoryRegistryInjectionToken);

    return (data) => registry.getEntityForData(data);
  },
  id: "get-entity-for-data",
});

export default getEntityForDataInjectable;
