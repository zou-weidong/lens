/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { deleteClusterInjectionToken } from "../../../common/ipc/cluster/delete.token";
import { implWithInvoke } from "../impl-channel";

const deleteClusterInjectable = implWithInvoke(deleteClusterInjectionToken);

export default deleteClusterInjectable;
