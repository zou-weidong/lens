/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import userExtensionsInjectable from "./user-extensions.injectable";

const enabledUserExtensionIdsInjectable = getInjectable({
  instantiate: (di) => {
    const userExtensions = di.inject(userExtensionsInjectable);

    return computed(() => new Set(userExtensions.get().map(ext => ext.id)));
  },
  id: "enabled-user-extension-ids",
});

export default enabledUserExtensionIdsInjectable;
