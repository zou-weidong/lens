/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import navigateInAppInjectable from "../../main/ipc/window/navigate-in-app.injectable";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";

export const navigate = asLegacyGlobalForExtensionApi(navigateInAppInjectable);
