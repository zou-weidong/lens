/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { clearClusterDeletingInjectionToken } from "../../../common/ipc/cluster/clear-deleting.token";
import { implWithInvoke } from "../impl-channel";

const clearClusterDeletingInjectable = implWithInvoke(clearClusterDeletingInjectionToken);

export default clearClusterDeletingInjectable;
