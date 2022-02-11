/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { catalogEntityRegistryInjectionToken } from "./registry.token";

const catalogEntitiesInjectable = getInjectable({
  instantiate: (di) => di.inject(catalogEntityRegistryInjectionToken).entities,
  id: "catalog-entities",
});

export default catalogEntitiesInjectable;
