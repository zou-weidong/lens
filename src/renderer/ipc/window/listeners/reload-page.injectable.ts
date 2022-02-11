/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { emitWindowReloadPageInjectionToken } from "../../../../common/ipc/window/reload-page.token";
import ipcRendererInjectable from "../../ipc-renderer.injectable";

const listener = () => {
  location.reload();
};

const reloadPageListenerInjectable = getInjectable({
  setup: async (di) => {
    const ipcRenderer = await di.inject(ipcRendererInjectable);

    emitWindowReloadPageInjectionToken.setupListener(ipcRenderer, listener);
  },
  instantiate: () => undefined,
  id: "reload-page-listener",
});

export default reloadPageListenerInjectable;
