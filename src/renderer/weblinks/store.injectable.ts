/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createWeblinkStoreInjectable from "../../common/weblinks/create-store.injectable";
import { weblinkStoreInjectionToken } from "../../common/weblinks/store-injection-token";

const weblinkStoreInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(createWeblinkStoreInjectable, {});

    store.load();

    return store;
  },
  injectionToken: weblinkStoreInjectionToken,
  id: "weblink-store-injectable",
});

export default weblinkStoreInjectable;
