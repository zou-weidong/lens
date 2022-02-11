/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithBroadcast } from "../../../common/ipc/impl-with-broadcast";
import { emitRouteProtocolInternalInjectionToken } from "../../../common/ipc/protocol-handler/router-internal.token";

const emitRouteProtocolInternalInjectable = implWithBroadcast(emitRouteProtocolInternalInjectionToken);

export default emitRouteProtocolInternalInjectable;
