/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { emitUpdateClusterStateInjectionToken } from "../../../common/ipc/cluster/state.token";
import { implWithBroadcast } from "../../../common/ipc/impl-with-broadcast";

const emitUpdateClusterStateInjectable = implWithBroadcast(emitUpdateClusterStateInjectionToken);

export default emitUpdateClusterStateInjectable;
