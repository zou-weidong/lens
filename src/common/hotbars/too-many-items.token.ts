/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";

export type OnTooManyHotbarItems = () => void;

export const onTooManyHotbarItemsInjectionToken = getInjectionToken<OnTooManyHotbarItems>({
  id: "on-too-many-hotbar-items-token",
});
