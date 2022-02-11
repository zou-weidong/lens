/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { disconnectClusterInjectionToken } from "../../../common/ipc/cluster/disconnect.token";
import { implWithInvoke } from "../impl-channel";

const disconnectClusterInjectable = implWithInvoke(disconnectClusterInjectionToken);

export default disconnectClusterInjectable;
