/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { requestUninstallExtensionInjectionToken } from "../../../common/ipc/extensions/uninstall.token";
import uninstallExtensionInjectable from "../../extensions/discovery/uninstall-extension.injectable";
import { implWithHandle } from "../impl-channel";

const handleUninstallExtensionInjectable = implWithHandle(requestUninstallExtensionInjectionToken, (di) => {
  return di.inject(uninstallExtensionInjectable);
});

export default handleUninstallExtensionInjectable;
