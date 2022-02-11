/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createExtensionsPreferencesStoreInjectable from "../../common/extensions/preferences/create-store.injectable";
import { extensionsPreferencesStoreInjectionToken } from "../../common/extensions/preferences/store-injection-token";

const extensionsPreferencesStoreInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(createExtensionsPreferencesStoreInjectable, {});

    store.load();

    return store;
  },
  injectionToken: extensionsPreferencesStoreInjectionToken,
  id: "extensions-preferences-store",
});

export default extensionsPreferencesStoreInjectable;
