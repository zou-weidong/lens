/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { setClusterAsVisibleInjectionToken } from "../../../common/ipc/cluster/set-as-visible.token";
import { implWithSend } from "../impl-channel";

const setClusterAsVisibleInjectable = implWithSend(setClusterAsVisibleInjectionToken);

export default setClusterAsVisibleInjectable;
