/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IObservableMapInitialValues } from "mobx";
import type { KubeconfigSyncValue } from ".";
import type { ReadonlyObservableMap } from "../utils";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface KubeConfigSyncs {
  readonly value: ReadonlyObservableMap<string, KubeconfigSyncValue>;
  readonly replace: (newState: IObservableMapInitialValues<string, KubeconfigSyncValue> | Readonly<[string, KubeconfigSyncValue]>[]) => void;
}

const kubeconfigSyncsInjectable = getInjectable({
  instantiate: (di): KubeConfigSyncs => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.syncKubeconfigEntries;
      },
      replace: (newState) => {
        store.syncKubeconfigEntries.replace(newState);
      },
    };
  },
  id: "kube-config-syncs",
});

export default kubeconfigSyncsInjectable;
