/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { iter } from "../../utils";
import type { InstalledExtensions } from "../installed.injectable";
import installedExtensionsInjectable from "../installed.injectable";
import type { ExtensionsPreferencesStore } from "./store";
import { extensionsPreferencesStoreInjectionToken } from "./store-injection-token";

interface Dependencies {
  store: ExtensionsPreferencesStore;
  installedExtensions: InstalledExtensions;
}

const getEnabledExtensionNames = ({
  store,
  installedExtensions,
}: Dependencies) => (
  () => {
    const enabledExtensionIds = store.enabledExtensionIds.get();

    return [
      ...iter.filterMap(installedExtensions, ([extId, { manifest }]) => enabledExtensionIds.has(extId) && manifest.name),
    ];
  }
);

const getEnabledExtensionNamesInjectable = getInjectable({
  instantiate: (di) => getEnabledExtensionNames({
    store: di.inject(extensionsPreferencesStoreInjectionToken),
    installedExtensions: di.inject(installedExtensionsInjectable),
  }),
  id: "get-enabled-extension-names",
});

export default getEnabledExtensionNamesInjectable;
