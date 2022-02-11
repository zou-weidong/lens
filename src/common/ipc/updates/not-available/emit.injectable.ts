/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithBroadcast } from "../../impl-with-broadcast";
import { emitUpdateNotAvailableInjectionToken } from "./emit.token";

const emitUpdateNotAvailableInjectable = implWithBroadcast(emitUpdateNotAvailableInjectionToken);

export default emitUpdateNotAvailableInjectable;
