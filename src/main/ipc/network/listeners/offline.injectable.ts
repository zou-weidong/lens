/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { emitNetworkOfflineInjectionToken } from "../../../../common/ipc/network/offline/emit.token";
import clusterManagerInjectable from "../../../clusters/manager.injectable";
import { implWithOn } from "../../impl-channel";

const networkOfflineListenerInjectable = implWithOn(emitNetworkOfflineInjectionToken, async (di) => {
  const manager = await di.inject(clusterManagerInjectable);

  return () => manager.onNetworkOffline();
});

export default networkOfflineListenerInjectable;
