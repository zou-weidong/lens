/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ObservableMap } from "mobx";
import { observable, observe } from "mobx";
import type { LensExtension } from "../../extensions/lens-extension";
import { getInjectable } from "@ogre-tools/injectable";
import type { ExtensionInstances } from "./instances.injectable";
import extensionInstancesInjectable from "./instances.injectable";
import type { NonInstanceExtensionNames } from "./non-instance-extension-names.injectable";
import nonInstanceExtensionNamesInjectable from "./non-instance-extension-names.injectable";

/**
 * Get an instance by its name in the manifest.
 * @param name extension name
 * @returns the instance if found, `false` if the extension is installed but does not have an instance for this "side", and `undefined` otherwise
 */
export type GetInstanceByName = (name: string) => LensExtension | undefined | false;

interface Dependencies {
  state: ObservableMap<string, LensExtension>;
  instances: ExtensionInstances;
  nonInstanceExtensionNames: NonInstanceExtensionNames;
}

const getInstanceByName = ({
  instances,
  nonInstanceExtensionNames,
  state,
}: Dependencies): GetInstanceByName => {
  observe(instances, change => {
    switch (change.type) {
      case "add":
        if (state.has(change.newValue.name)) {
          throw new TypeError("Extension names must be unique");
        }

        state.set(change.newValue.name, change.newValue);
        break;
      case "delete":
        state.delete(change.oldValue.name);
        break;
      case "update":
        throw new Error("Extension instances shouldn't be updated");
    }
  });

  return (name) => {
    if (nonInstanceExtensionNames.has(name)) {
      return false;
    }

    return state.get(name);
  };
};

const extensionInstancesByNameInjectable = getInjectable({
  instantiate: (di) => getInstanceByName({
    state: observable.map(),
    instances: di.inject(extensionInstancesInjectable),
    nonInstanceExtensionNames: di.inject(nonInstanceExtensionNamesInjectable),
  }),
  id: "get-instance-by-name",
});

export default extensionInstancesByNameInjectable;
