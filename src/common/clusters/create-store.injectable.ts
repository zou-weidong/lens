/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import appEventBusInjectable from "../app-event-bus/app-event-bus.injectable";
import type { BaseStoreParams } from "../base-store";
import { createClusterInjectionToken } from "../clusters/create-cluster-injection-token";
import type { ClusterStoreModel } from "./store";
import { ClusterStore } from "./store";
import clusterStoreLoggerInjectable from "./store-logger.injectable";
import directoryForUserDataInjectable from "../paths/user-data.injectable";

const createClusterStoreInjectable = getInjectable({
  instantiate: (di, params: BaseStoreParams<ClusterStoreModel>) => (
    new ClusterStore({
      createCluster: di.inject(createClusterInjectionToken),
      logger: di.inject(clusterStoreLoggerInjectable),
      appEventBus: di.inject(appEventBusInjectable),
      userDataPath: di.inject(directoryForUserDataInjectable),
    }, params)
  ),
  lifecycle: lifecycleEnum.transient,
  id: "create-cluster-store",
});

export default createClusterStoreInjectable;
