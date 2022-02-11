/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../channel";

export type InvalidProtocolUrl = (url: string, error: string) => void;

export const emitInvalidProtocolUrlInjectionToken = getChannelEmitterInjectionToken<InvalidProtocolUrl>("protocol-handler:invalid");
