/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../channel";

export type NavigateExtension = (extId: string, pageId?: string, params?: Record<string, any>) => void;

export const emitNavigateExtensionInjectionToken = getChannelEmitterInjectionToken<NavigateExtension>("window:navigate-extension");
