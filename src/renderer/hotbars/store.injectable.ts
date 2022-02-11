/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createHotbarStoreInjectable from "../../common/hotbars/create-store.injectable";
import { hotbarStoreInjectionToken } from "../../common/hotbars/store-injection-token";

const hotbarStoreInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(createHotbarStoreInjectable, {});

    store.load();

    return store;
  },
  injectionToken: hotbarStoreInjectionToken,
  id: "hotbar-store",
});

export default hotbarStoreInjectable;
