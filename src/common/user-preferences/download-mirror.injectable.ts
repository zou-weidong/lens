/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface DownloadMirror {
  readonly value: string;
  set: (value: string) => void;
}

const downloadMirrorInjectable = getInjectable({
  instantiate: (di): DownloadMirror => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      get value() {
        return store.downloadMirror;
      },
      set: (value) => {
        store.downloadMirror = value;
      },
    };
  },
  id: "download-mirror",
});

export default downloadMirrorInjectable;
