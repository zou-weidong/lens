/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithBroadcast } from "../../../common/ipc/impl-with-broadcast";
import { emitInvalidProtocolUrlInjectionToken } from "../../../common/ipc/protocol-handler/invalid.token";

const emitInvalidProtocolUrlInjectable = implWithBroadcast(emitInvalidProtocolUrlInjectionToken);

export default emitInvalidProtocolUrlInjectable;
