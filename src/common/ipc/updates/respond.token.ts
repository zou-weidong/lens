/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../channel";

export type UpdateAvailableResponse = {
  doUpgrade: false;
} | {
  doUpgrade: true;
  now: boolean;
};

export type UpdateAvailableRespond = (response: UpdateAvailableResponse) => void;

export const updateAvailableRespondInjectionToken = getChannelEmitterInjectionToken<UpdateAvailableRespond>("updates:accept");
