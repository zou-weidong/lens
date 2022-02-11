/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithBroadcast } from "../../impl-with-broadcast";
import { emitNetworkOnlineInjectionToken } from "./emit.token";

const emitNetworkOnlineInjectable = implWithBroadcast(emitNetworkOnlineInjectionToken);

export default emitNetworkOnlineInjectable;
