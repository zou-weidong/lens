/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { windowOpenAppContextMenuInjectionToken } from "../../../common/ipc/window/open-app-context-menu.token";
import { implWithSend } from "../impl-channel";

const windowOpenAppContextMenuInjectable = implWithSend(windowOpenAppContextMenuInjectionToken);

export default windowOpenAppContextMenuInjectable;
