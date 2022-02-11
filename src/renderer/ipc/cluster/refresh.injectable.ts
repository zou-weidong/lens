/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { refreshClusterInjectionToken } from "../../../common/ipc/cluster/refresh.token";
import { implWithInvoke } from "../impl-channel";

const refreshClusterInjectable = implWithInvoke(refreshClusterInjectionToken);

export default refreshClusterInjectable;
