/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../channel";

export type WindowOpenAppContextMenu = () => void;

export const windowOpenAppContextMenuInjectionToken = getChannelEmitterInjectionToken<WindowOpenAppContextMenu>("window:open-app-context-menu");
