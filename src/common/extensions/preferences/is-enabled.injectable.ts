/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { InstalledExtension } from "../installed.injectable";
import type { ExtensionsPreferencesStore } from "./store";
import { extensionsPreferencesStoreInjectionToken } from "./store-injection-token";

/**
 * The function is used for checking if a given extension should be enabled.
 */
export type IsExtensionEnabled = (extension: Pick<InstalledExtension, "id" | "isBundled">) => boolean;

interface Dependencies {
  store: ExtensionsPreferencesStore;
}

const isExtensionEnabled = ({ store }: Dependencies): IsExtensionEnabled => (
  (extension) => store.isEnabled(extension)
);

const isExtensionEnabledInjectable = getInjectable({
  instantiate: (di) => isExtensionEnabled({
    store: di.inject(extensionsPreferencesStoreInjectionToken),
  }),
  id: "is-extension-enabled",
});

export default isExtensionEnabledInjectable;
