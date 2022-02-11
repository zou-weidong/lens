/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { activateClusterInjectionToken } from "../../../common/ipc/cluster/activate.token";
import { implWithInvoke } from "../impl-channel";

const activateClusterInjectable = implWithInvoke(activateClusterInjectionToken);

export default activateClusterInjectable;
