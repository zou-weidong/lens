/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import getHotbarByIdInjectable from "./get-by-id.injectable";
import { hotbarStoreInjectionToken } from "./store-injection-token";

const activeHotbarInjectable = getInjectable({
  instantiate: (di) => {
    const getHotbarById = di.inject(getHotbarByIdInjectable);
    const store = di.inject(hotbarStoreInjectionToken);

    return computed(() => getHotbarById(store.activeHotbarId));
  },
  id: "active-hotbar",
});

export default activeHotbarInjectable;
