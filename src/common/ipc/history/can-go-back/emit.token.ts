/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../../channel";

export type CanGoBack = (canGoBack: boolean) => void;

export const emitCanGoBackInjectionToken = getChannelEmitterInjectionToken<CanGoBack>("history:can-go-back");
