/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { requestClusterShellApiInjectionToken } from "../../../common/ipc/cluster/shell-api.token";
import { implWithInvoke } from "../impl-channel";

const requestClusterShellApiInjectable = implWithInvoke(requestClusterShellApiInjectionToken);

export default requestClusterShellApiInjectable;
