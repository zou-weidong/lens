/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreInjectionToken } from "./store-injection-token";

export type SetActiveHotbar = (id: string) => void;

const setActiveHotbarInjectable = getInjectable({
  instantiate: (di): SetActiveHotbar => {
    const store = di.inject(hotbarStoreInjectionToken);

    return (id) => store.setActiveHotbar(id);
  },
  id: "set-active-hotbar",
});

export default setActiveHotbarInjectable;
