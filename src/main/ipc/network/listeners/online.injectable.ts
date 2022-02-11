/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { emitNetworkOnlineInjectionToken } from "../../../../common/ipc/network/online/emit.token";
import clusterManagerInjectable from "../../../clusters/manager.injectable";
import { implWithOn } from "../../impl-channel";

const networkOnlineListenerInjectable = implWithOn(emitNetworkOnlineInjectionToken, async (di) => {
  const manager = await di.inject(clusterManagerInjectable);

  return () => manager.onNetworkOnline();
});

export default networkOnlineListenerInjectable;
