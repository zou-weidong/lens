/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { setExtensionInstallingInjectionToken } from "../../../common/ipc/extensions/set-installing.token";
import { implWithBroadcast } from "../../../common/ipc/impl-with-broadcast";

const setExtensionInstallingInjectable = implWithBroadcast(setExtensionInstallingInjectionToken);

export default setExtensionInstallingInjectable;
