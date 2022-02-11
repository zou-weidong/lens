/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { UpdateInfo } from "electron-updater";
import { getChannelEmitterInjectionToken } from "../../channel";

export type UpdateAvailable = (info: UpdateInfo) => void;

export const emitUpdateAvailableInjectionToken = getChannelEmitterInjectionToken<UpdateAvailable>("updates:available");
