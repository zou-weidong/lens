/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithInvoke } from "../impl-channel";
import { openFileDialogInjectionToken } from "../../../common/ipc/file-dialog/open.token";

const openFileDialogInjectable = implWithInvoke(openFileDialogInjectionToken);

export default openFileDialogInjectable;
