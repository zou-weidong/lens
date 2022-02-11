/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { setClusterDeletingInjectionToken } from "../../../common/ipc/cluster/set-deleting.token";
import { implWithInvoke } from "../impl-channel";

const setClusterDeletingInjectable = implWithInvoke(setClusterDeletingInjectionToken);

export default setClusterDeletingInjectable;
