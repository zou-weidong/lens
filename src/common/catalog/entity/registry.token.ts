/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { BaseCatalogEntityRegistry } from "./registry";

export const catalogEntityRegistryInjectionToken = getInjectionToken<BaseCatalogEntityRegistry>({
  id: "catalog-entity-registry-token",
});
