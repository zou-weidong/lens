/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface KubectlBinariesPath {
  readonly value: string;
  set: (value: string) => void;
}

const kubectlBinariesPathInjectable = getInjectable({
  instantiate: (di): KubectlBinariesPath => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.kubectlBinariesPath;
      },
      set: (value) => {
        store.kubectlBinariesPath = value;
      },
    };
  },
  id: "kubectl-binaries-path",
});

export default kubectlBinariesPathInjectable;
