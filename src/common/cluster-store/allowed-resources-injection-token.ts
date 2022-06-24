/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";

export const allowedResourcesInjectionToken = getInjectionToken<IComputedValue<Set<string>>>({
  id: "allowed-resources",
});
