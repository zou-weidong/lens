/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithBroadcast } from "../../impl-with-broadcast";
import { emitCanGoForwardInjectionToken } from "./emit.token";

const emitCanGoForwardInjectable = implWithBroadcast(emitCanGoForwardInjectionToken);

export default emitCanGoForwardInjectable;

