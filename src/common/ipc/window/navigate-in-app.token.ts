/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../channel";

export type NavigateInApp = (location: string) => void;

export const emitNavigateInAppInjectionToken = getChannelEmitterInjectionToken<NavigateInApp>("window:navigate-in-app");
