/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { windowLocationChangedInjectionToken } from "../../../common/ipc/window/location-changed.token";
import { implWithSend } from "../impl-channel";

const windowLocationChangedInjectable = implWithSend(windowLocationChangedInjectionToken);

export default windowLocationChangedInjectable;
