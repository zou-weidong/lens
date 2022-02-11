/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { clearExtensionInstallingInjectionToken } from "../../../common/ipc/extensions/clear-installing.token";
import { implWithBroadcast } from "../../../common/ipc/impl-with-broadcast";

const clearExtensionInstallingInjectable = implWithBroadcast(clearExtensionInstallingInjectionToken);

export default clearExtensionInstallingInjectable;
