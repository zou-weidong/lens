/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../channel";

export type BroadcastMessage = (channel: string, ...args: any[]) => void;

export const broadcastMessageInjectionToken = getChannelEmitterInjectionToken<BroadcastMessage>("broadcast:message");
