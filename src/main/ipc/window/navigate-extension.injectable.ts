/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { emitNavigateExtensionInjectionToken } from "../../../common/ipc/window/navigate-extension.token";

export type NavigateExtension = (extId: string, pageId?: string, params?: Record<string, any>, frameId?: number) => void;

const navigateExtensionInjectable = getInjectable({
  instantiate: (di): NavigateExtension => {
    const sendToView = emitNavigateExtensionInjectionToken.getSendToView(di);

    return (extId, pageId, params, frameId) => sendToView([extId, pageId, params], frameId);
  },
  injectionToken: emitNavigateExtensionInjectionToken.token,
  id: "navigate-extension",
});

export default navigateExtensionInjectable;
