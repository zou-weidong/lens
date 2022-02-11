/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { emitVisibleClusterChangedInjectionToken } from "../../../common/ipc/window/visible-cluster-changed.token";
import activeClusterIdInjectable from "../../window/active-cluster-id.injectable";
import { implWithOn } from "../impl-channel";

const emitVisibleClusterChangedInjectable = implWithOn(emitVisibleClusterChangedInjectionToken, async (di) => {
  const activeClusterId = await di.inject(activeClusterIdInjectable);

  return (clusterId) => {
    activeClusterId.set(clusterId);
  };
});

export default emitVisibleClusterChangedInjectable;
