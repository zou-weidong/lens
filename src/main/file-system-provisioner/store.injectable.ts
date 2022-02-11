/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createFileSystemProvisionerStoreInjectable from "../../common/file-system-provisioner/create-store.injectable";
import { fileSystemProvisionerStoreInjectionToken } from "../../common/file-system-provisioner/store-injection-token";
import versionedMigrationsInjectable from "./migrations/versioned.injectable";

const fileSystemProvisionerStoreInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(createFileSystemProvisionerStoreInjectable, {
      migrations: di.inject(versionedMigrationsInjectable),
    });

    store.load();

    return store;
  },
  injectionToken: fileSystemProvisionerStoreInjectionToken,
  id: "file-system-provisioner-store",
});

export default fileSystemProvisionerStoreInjectable;
