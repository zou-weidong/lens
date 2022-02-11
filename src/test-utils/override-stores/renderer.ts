/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer, Injectable } from "@ogre-tools/injectable";
import createClusterStoreInjectable from "../../common/clusters/create-store.injectable";
import createExtensionsPreferencesStoreInjectable from "../../common/extensions/preferences/create-store.injectable";
import createFileSystemProvisionerStoreInjectable from "../../common/file-system-provisioner/create-store.injectable";
import createHotbarStoreInjectable from "../../common/hotbars/create-store.injectable";
import createUserPreferencesStoreInjectable from "../../common/user-preferences/create-store.injectable";
import createWeblinkStoreInjectable from "../../common/weblinks/create-store.injectable";
import extensionsPreferencesStoreInjectable from "../../renderer/extensions/preferences-store.injectable";
import hotbarStoreInjectable from "../../renderer/hotbars/store.injectable";
import userPreferencesStoreInjectable from "../../renderer/user-preferences/store.injectable";
import weblinkStoreInjectable from "../../renderer/weblinks/store.injectable";
import clusterStoreInjectable from "../../renderer/clusters/store.injectable";
import type { BaseStoreParams } from "../../common/base-store";
import fileSystemProvisionerStoreInjectable from "../../renderer/file-system-provisioner/store.injectable";

type StoreCreatePair<T> = [Injectable<T, T, void>, Injectable<T, T, BaseStoreParams<any>>];

export const storeInjectionTokens = {
  "user-preferences-store-token": [userPreferencesStoreInjectable, createUserPreferencesStoreInjectable],
  "cluster-store-token": [clusterStoreInjectable, createClusterStoreInjectable],
  "file-system-provisioner-store-token": [fileSystemProvisionerStoreInjectable, createFileSystemProvisionerStoreInjectable],
  "weblink-store-token": [weblinkStoreInjectable, createWeblinkStoreInjectable],
  "hotbar-store-token": [hotbarStoreInjectable, createHotbarStoreInjectable],
  "extensions-preferences-store-token": [extensionsPreferencesStoreInjectable, createExtensionsPreferencesStoreInjectable],
};

export function overrideStores(di: DiContainer, storesNotToOverride: (keyof typeof storeInjectionTokens)[] = []) {
  for (const [name, pair] of Object.entries(storeInjectionTokens)) {
    if (storesNotToOverride.includes(name as keyof typeof storeInjectionTokens)) {
      continue;
    }

    const [injectable, createStore] = pair as StoreCreatePair<unknown>;

    // By default don't inject migrations or call `load`
    di.override(injectable, () => di.inject(createStore, {}));
  }
}
