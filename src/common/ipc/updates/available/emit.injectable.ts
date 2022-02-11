/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithBroadcast } from "../../impl-with-broadcast";
import { emitUpdateAvailableInjectionToken } from "./emit.token";

const emitUpdateAvailableInjectable = implWithBroadcast(emitUpdateAvailableInjectionToken);

export default emitUpdateAvailableInjectable;
