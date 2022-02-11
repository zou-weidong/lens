/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { OrderDirection } from "./store";
import { hotbarStoreInjectionToken } from "./store-injection-token";

export type SwitchHotbar = (direction: OrderDirection) => void;

const switchHotbarInjectable = getInjectable({
  instantiate: (di): SwitchHotbar => {
    const store = di.inject(hotbarStoreInjectionToken);

    return (direction) => store.switchHotbar(direction);
  },
  id: "switch-hotbar",
});

export default switchHotbarInjectable;
