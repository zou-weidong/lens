/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { emitVisibleClusterChangedInjectionToken } from "../../../common/ipc/window/visible-cluster-changed.token";
import { implWithSend } from "../impl-channel";

const emitVisibleClusterChangedInjectable = implWithSend(emitVisibleClusterChangedInjectionToken);

export default emitVisibleClusterChangedInjectable;
