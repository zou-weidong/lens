/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../channel";

export type WindowLocationChanged = () => void;

export const windowLocationChangedInjectionToken = getChannelEmitterInjectionToken<WindowLocationChanged>("window:location-changed");
