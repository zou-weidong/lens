/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Hotbar } from "./hotbar";
import { hotbarStoreInjectionToken } from "./store-injection-token";

export type GetDisplayIndex = (hotbar: Hotbar) => string;

const getDisplayIndexInjectable = getInjectable({
  instantiate: (di): GetDisplayIndex => {
    const store = di.inject(hotbarStoreInjectionToken);

    return (hotbar) => store.getDisplayIndex(hotbar);
  },
  id: "get-display-index",
});

export default getDisplayIndexInjectable;
