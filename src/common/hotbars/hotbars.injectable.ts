/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreInjectionToken } from "./store-injection-token";

const hotbarsInjectable = getInjectable({
  id: "hotbars",
  instantiate: (di) => di.inject(hotbarStoreInjectionToken).hotbars,
});

export default hotbarsInjectable;
