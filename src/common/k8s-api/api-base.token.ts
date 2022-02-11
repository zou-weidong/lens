/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { JsonApiData, JsonApiHandler } from "./json-api";

export const apiBaseInjectionToken = getInjectionToken<JsonApiHandler<JsonApiData>>({
  id: "api-base-token",
});
