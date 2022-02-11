/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithBroadcast } from "../../impl-with-broadcast";
import { emitListNamespacesForbiddenInjectionToken } from "./emit.token";

const emitListNamespacesForbiddenInjectable = implWithBroadcast(emitListNamespacesForbiddenInjectionToken);

export default emitListNamespacesForbiddenInjectable;
