/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clusterStoreInjectionToken } from "../../common/clusters/store-injection-token";
import versionedMigrationsInjectable from "./migrations/versioned.injectable";
import createClusterStoreInjectable from "../../common/clusters/create-store.injectable";
import { reaction } from "mobx";

const clusterStoreInjectable = getInjectable({
  instantiate: (di) => {
    const store = di.inject(createClusterStoreInjectable, {
      migrations: di.inject(versionedMigrationsInjectable),
    });

    store.load();

    // TODO: remove state sync that isn't part of the catalog
    reaction(
      () => store.connectedClustersList.get(),
      (clusters) => {
        for (const cluster of clusters) {
          cluster.pushState();
        }
      },
    );

    return store;
  },
  injectionToken: clusterStoreInjectionToken,
  id: "cluster-store",
});

export default clusterStoreInjectable;
