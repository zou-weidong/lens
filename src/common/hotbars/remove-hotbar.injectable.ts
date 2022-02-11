/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { hotbarStoreInjectionToken } from "./store-injection-token";

export type RemoveHotbar = (id: string) => void;

const removeHotbarInjectable = getInjectable({
  instantiate: (di): RemoveHotbar => {
    const store = di.inject(hotbarStoreInjectionToken);

    return (id) => store.remove(id);
  },
  id: "remove-hotbar",
});

export default removeHotbarInjectable;

