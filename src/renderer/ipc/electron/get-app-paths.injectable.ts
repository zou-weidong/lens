/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getAppPathsInjectionToken } from "../../../common/ipc/electron/get-app-paths.token";
import { implWithInvoke } from "../impl-channel";

const getAppPathsInjectable = implWithInvoke(getAppPathsInjectionToken);

export default getAppPathsInjectable;
