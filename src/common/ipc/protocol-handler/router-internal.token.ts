/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RouteAttempt } from "../../protocol-handler/router";
import { getChannelEmitterInjectionToken } from "../channel";

export type RouteProtocolInternal = (url: string, attempt: RouteAttempt) => void;

export const emitRouteProtocolInternalInjectionToken = getChannelEmitterInjectionToken<RouteProtocolInternal>("protocol-handler:route-internal");
