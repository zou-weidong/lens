/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelInjectionToken } from "../channel";

export type UninstallExtension = (extId: string) => Promise<void>;

export const requestUninstallExtensionInjectionToken = getChannelInjectionToken<UninstallExtension>("extensions:uninstall");
