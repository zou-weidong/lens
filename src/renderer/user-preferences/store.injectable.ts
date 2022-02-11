/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createUserPreferencesStoreInjectable from "../../common/user-preferences/create-store.injectable";
import { userPreferencesStoreInjectionToken } from "../../common/user-preferences/store-injection-token";

const userPreferencesStoreInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(createUserPreferencesStoreInjectable, {});

    store.load();

    return store;
  },
  injectionToken: userPreferencesStoreInjectionToken,
  id: "user-preferences-store-injectable",
});

export default userPreferencesStoreInjectable;
