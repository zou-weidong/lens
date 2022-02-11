/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { requestUninstallExtensionInjectionToken } from "../../../common/ipc/extensions/uninstall.token";
import { implWithInvoke } from "../impl-channel";

const requestUninstallExtensionInjectable = implWithInvoke(requestUninstallExtensionInjectionToken);

export default requestUninstallExtensionInjectable;
