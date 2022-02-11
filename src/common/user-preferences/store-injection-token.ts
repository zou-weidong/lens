/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { UserPreferencesStore } from "./store";

export const userPreferencesStoreInjectionToken = getInjectionToken<UserPreferencesStore>({
  id: "user-preferences-store-token",
});
