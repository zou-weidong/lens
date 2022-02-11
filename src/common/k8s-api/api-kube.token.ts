/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { JsonApiHandler } from "./json-api";
import type { KubeJsonApiData } from "./kube-json-api";

export const apiKubeInjectionToken = getInjectionToken<JsonApiHandler<KubeJsonApiData>>({
  id: "api-kube-token",
});
