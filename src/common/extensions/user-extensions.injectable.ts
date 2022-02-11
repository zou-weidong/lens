/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import enabledExtensionsInjectable from "./enabled-extensions.injectable";

const userExtensionsInjectable = getInjectable({
  instantiate: (di) => {
    const enabledExtensions = di.inject(enabledExtensionsInjectable);

    return computed(() => enabledExtensions.get().filter(extension => !extension.isBundled));
  },
  id: "user-extensions",
});

export default userExtensionsInjectable;
