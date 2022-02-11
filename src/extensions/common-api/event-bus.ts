/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";

export type { AppEvent } from "../../common/app-event-bus/event-bus";

export const appEventBus = asLegacyGlobalForExtensionApi(appEventBusInjectable);
