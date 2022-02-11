/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { onTooManyHotbarItemsInjectionToken } from "../../common/hotbars/too-many-items.token";
import { noop } from "../../common/utils";

const onTooManyHotbarItemsInjectable = getInjectable({
  instantiate: () => noop,
  injectionToken: onTooManyHotbarItemsInjectionToken,
  id: "on-too-many-hotbar-items",
});

export default onTooManyHotbarItemsInjectable;
