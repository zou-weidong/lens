/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../channel";

export type SetExtensionInstalling = (extId: string) => void;

export const setExtensionInstallingInjectionToken = getChannelEmitterInjectionToken<SetExtensionInstalling>("extensions:installing:set");
