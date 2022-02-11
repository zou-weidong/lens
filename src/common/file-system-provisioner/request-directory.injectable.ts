/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { FileSystemProvisionerStore } from "./store";
import { fileSystemProvisionerStoreInjectionToken } from "./store-injection-token";

interface Dependencies {
  store: FileSystemProvisionerStore;
}

export type RequestDirectory = (extId: string) => Promise<string>;

const requestDirectory = ({ store }: Dependencies): RequestDirectory => (
  (extId) => store.requestDirectory(extId)
);

const requestDirectoryInjectable = getInjectable({
  instantiate: (di) => requestDirectory({
    store: di.inject(fileSystemProvisionerStoreInjectionToken),
  }),
  id: "request-directory",
});

export default requestDirectoryInjectable;
