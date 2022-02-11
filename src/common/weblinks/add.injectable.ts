/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { WeblinkCreateOptions, WeblinkData } from "./store";
import { weblinkStoreInjectionToken } from "./store-injection-token";

export type AddWeblink = (data: WeblinkCreateOptions) => WeblinkData;

const addWeblinkInjectable = getInjectable({
  instantiate: (di): AddWeblink => {
    const store = di.inject(weblinkStoreInjectionToken);

    return (data) => store.add(data);
  },
  id: "add-weblink",
});

export default addWeblinkInjectable;
