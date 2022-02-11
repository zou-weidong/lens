/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createHotbarStoreInjectable from "../../common/hotbars/create-store.injectable";
import { hotbarStoreInjectionToken } from "../../common/hotbars/store-injection-token";
import syncGeneralEntitiesInjectable from "../catalog/local-sources/general/sync-entities.injectable";
import syncWeblinkEntitiesInjectable from "../catalog/local-sources/weblinks/sync-entities.injectable";
import versionedMigrationsInjectable from "./migrations/versioned.injectable";

const hotbarStoreInjectable = getInjectable({
  setup: async (di) => {
    const syncGeneralEntities = await di.inject(syncGeneralEntitiesInjectable);
    const syncWeblinkEntities = await di.inject(syncWeblinkEntitiesInjectable);

    syncGeneralEntities();
    syncWeblinkEntities();
  },
  instantiate: (di) => {
    const store = di.inject(createHotbarStoreInjectable, {
      migrations: di.inject(versionedMigrationsInjectable),
    });

    store.load();

    return store;
  },
  injectionToken: hotbarStoreInjectionToken,
  id: "hotbar-store",
});

export default hotbarStoreInjectable;
