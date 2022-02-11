/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export type LensProcess = "main" | "renderer";

export const lensProcessInjectionToken = getInjectionToken<LensProcess>({
  id: "lens-process-name-token",
});
