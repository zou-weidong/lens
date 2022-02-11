/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../../channel";

export type CanGoForward = (canGoForward: boolean) => void;

export const emitCanGoForwardInjectionToken = getChannelEmitterInjectionToken<CanGoForward>("history:can-go-forward");
