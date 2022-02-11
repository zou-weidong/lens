/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CreateHotbarData, CreateHotbarOptions } from "./hotbar-types";
import { hotbarStoreInjectionToken } from "./store-injection-token";

export type AddHotbar = (data: CreateHotbarData, opts?: CreateHotbarOptions) => void;

const addHotbarInjectable = getInjectable({
  instantiate: (di): AddHotbar => {
    const store = di.inject(hotbarStoreInjectionToken);

    return (data, opts) => store.add(data, opts);
  },
  id: "add-hotbar",
});

export default addHotbarInjectable;
