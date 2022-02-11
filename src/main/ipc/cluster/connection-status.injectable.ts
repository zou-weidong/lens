/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { emitConnectionUpdateInjectionToken } from "../../../common/ipc/cluster/connection-update.token";
import { implWithBroadcast } from "../../../common/ipc/impl-with-broadcast";

const emitConnectionUpdateInjectable = implWithBroadcast(emitConnectionUpdateInjectionToken);

export default emitConnectionUpdateInjectable;
