/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import customResourceDefinitionStoreInjectable from "./store.injectable";

const customResourceDefinitionsInjectable = getInjectable({
  id: "custom-resource-definitions",

  instantiate: (di) => {
    const store = di.inject(customResourceDefinitionStoreInjectable);

    return computed(() => store.getItems());
  },
});

export default customResourceDefinitionsInjectable;
