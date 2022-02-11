/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { emitNavigateExtensionInjectionToken, NavigateExtension } from "../../../../common/ipc/window/navigate-extension.token";
import type { LensLogger } from "../../../../common/logger";
import { baseLoggerInjectionToken } from "../../../../common/logger/base-logger.token";
import type { LensRendererExtension } from "../../../../extensions/lens-renderer-extension";
import getExtensionByIdInjectable from "../../../extensions/get-by-id.injectable";
import ipcRendererInjectable from "../../ipc-renderer.injectable";

interface Dependencies {
  logger: LensLogger;
  getExtensionById: (extId: string) => LensRendererExtension | undefined;
}

const listener = ({ logger, getExtensionById }: Dependencies): NavigateExtension => (
  (extId, pageId, params) => {
    const extension = getExtensionById(extId);

    if (extension) {
      logger.info(`navigate to extensionId=${extId}`, { pageId, params });
      extension.navigate(pageId, params);
    } else {
      logger.warn(`tried to navigate to extensionId=${extId}, not found`);
    }
  }
);

const navigateExtensionListenerInjectable = getInjectable({
  setup: async (di) => {
    const ipcRenderer = await di.inject(ipcRendererInjectable);

    emitNavigateExtensionInjectionToken.setupListener(ipcRenderer, listener({
      logger: await di.inject(baseLoggerInjectionToken),
      getExtensionById: await di.inject(getExtensionByIdInjectable),
    }));
  },
  instantiate: () => undefined,
  id: "navigate-extension-listener",
});

export default navigateExtensionListenerInjectable;
