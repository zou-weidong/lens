/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../channel";

export type ClearExtensionInstalling = (extId: string) => void;

export const clearExtensionInstallingInjectionToken = getChannelEmitterInjectionToken<ClearExtensionInstalling>("extensions:installing:clear");
