/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import { iter } from "../utils";
import installedExtensionsInjectable from "./installed.injectable";
import extensionInstancesInjectable from "./instances.injectable";

const enabledExtensionsInjectable = getInjectable({
  instantiate: (di) => {
    const installedExtensions = di.inject(installedExtensionsInjectable);
    const extensionInstances = di.inject(extensionInstancesInjectable);

    return computed(() => (
      Array.from(
        iter.filter(
          installedExtensions.values(),
          extension => extensionInstances.get(extension.id).hasBeenEnabled,
        ),
      )
    ));
  },
  id: "enabled-extensions",
});

export default enabledExtensionsInjectable;
