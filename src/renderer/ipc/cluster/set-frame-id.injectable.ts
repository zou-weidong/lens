/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { setClusterFrameIdInjectionToken } from "../../../common/ipc/cluster/set-frame-id.token";
import { implWithInvoke } from "../impl-channel";

const setClusterFrameIdInjectable = implWithInvoke(setClusterFrameIdInjectionToken);

export default setClusterFrameIdInjectable;
