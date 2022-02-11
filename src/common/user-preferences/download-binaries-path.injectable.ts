/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface DownloadBinariesPath {
  readonly value: string;
  set: (value: string) => void;
}

const downloadBinariesPathInjectable = getInjectable({
  instantiate: (di): DownloadBinariesPath => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.downloadBinariesPath;
      },
      set: (value) => {
        store.downloadBinariesPath = value;
      },
    };
  },
  id: "download-binaries-path",
});

export default downloadBinariesPathInjectable;
