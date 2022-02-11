/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { extensionLoadedInjectionToken } from "../../../common/ipc/extensions/loaded.token";
import { implWithSend } from "../impl-channel";

const extensionLoadedInjectable = implWithSend(extensionLoadedInjectionToken);

export default extensionLoadedInjectable;
