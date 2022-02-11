/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { emitNavigateInAppInjectionToken } from "../../../common/ipc/window/navigate-in-app.token";

const navigateInAppInjectable = getInjectable({
  instantiate: (di) => {
    const sendToView = emitNavigateInAppInjectionToken.getSendToView(di);

    return (url) => sendToView([url]);
  },
  injectionToken: emitNavigateInAppInjectionToken.token,
  id: "navigate-in-app",
});

export default navigateInAppInjectable;
