/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../../channel";

export type UpdateNotAvailable = () => void;

export const emitUpdateNotAvailableInjectionToken = getChannelEmitterInjectionToken<UpdateNotAvailable>("updates:not-available");
