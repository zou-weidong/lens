/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { ExtensionsPreferencesStore } from "./store";

export const extensionsPreferencesStoreInjectionToken = getInjectionToken<ExtensionsPreferencesStore>({
  id: "extensions-preferences-store-token",
});
