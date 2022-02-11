/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithBroadcast } from "../../../common/ipc/impl-with-broadcast";
import { emitRouteProtocolExternalInjectionToken } from "../../../common/ipc/protocol-handler/router-external.token";

const emitRouteProtocolExternalInjectable = implWithBroadcast(emitRouteProtocolExternalInjectionToken);

export default emitRouteProtocolExternalInjectable;
