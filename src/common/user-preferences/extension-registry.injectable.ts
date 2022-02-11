/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { ExtensionRegistry } from "./preferences-helpers";
import { ExtensionRegistryLocation } from "./preferences-helpers";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface ExtensionRegistryUrl {
  readonly value: Readonly<ExtensionRegistry>;
  setUrl: (url: string) => void;
  setLocation: (location: ExtensionRegistryLocation) => void;
}

const extensionRegistryUrlInjectable = getInjectable({
  instantiate: (di): ExtensionRegistryUrl => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.extensionRegistryUrl;
      },
      setLocation: action((location) => {
        store.extensionRegistryUrl.location = location;

        if (store.extensionRegistryUrl.location === ExtensionRegistryLocation.CUSTOM) {
          store.extensionRegistryUrl.customUrl = "";
        }
      }),
      setUrl: (url) => {
        if (store.extensionRegistryUrl.location !== ExtensionRegistryLocation.CUSTOM) {
          throw new Error("Cannot set extensionRegistry.customUrl when location is not CUSTOM");
        }

        store.extensionRegistryUrl.customUrl = url;
      },
    };
  },
  id: "extension-registry-url",
});

export default extensionRegistryUrlInjectable;
