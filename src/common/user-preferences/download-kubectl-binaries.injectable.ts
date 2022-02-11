/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface DownloadKubectlBinaries {
  readonly value: boolean;
  toggle: () => void;
}

const downloadKubectlBinariesInjectable = getInjectable({
  instantiate: (di): DownloadKubectlBinaries => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.downloadKubectlBinaries;
      },
      toggle: () => {
        store.downloadKubectlBinaries = !store.downloadKubectlBinaries;
      },
    };
  },
  id: "download-kubectl-binaries",
});

export default downloadKubectlBinariesInjectable;
