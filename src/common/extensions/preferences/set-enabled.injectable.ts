/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensExtensionId } from "../manifest";
import type { ExtensionsPreferencesStore } from "./store";
import { extensionsPreferencesStoreInjectionToken } from "./store-injection-token";

interface Dependencies {
  store: ExtensionsPreferencesStore;
}

export type SetExtensionEnabled = (ext: LensExtensionId, enabled: boolean) => void;

const setExtensionEnabled = ({
  store,
}: Dependencies): SetExtensionEnabled => (
  (extId, enabled) => store.setEnabled(extId, enabled)
);

const setExtensionEnabledInjectable = getInjectable({
  instantiate: (di) => setExtensionEnabled({
    store: di.inject(extensionsPreferencesStoreInjectionToken),
  }),
  id: "set-extension-enabled",
});

export default setExtensionEnabledInjectable;
