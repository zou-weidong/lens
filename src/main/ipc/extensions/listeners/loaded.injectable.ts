/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import installedExtensionsInjectable from "../../../../common/extensions/installed.injectable";
import { extensionLoadedInjectionToken } from "../../../../common/ipc/extensions/loaded.token";
import bundledExtensionsEventEmitterInjectable from "../../../extensions/bundled-loaded.injectable";
import { implWithOn } from "../../impl-channel";
import rendererExtensionsLoadedInjectable from "../extensions-loaded.injectable";

const extensionLoadedListenerInjectable = implWithOn(extensionLoadedInjectionToken, async (di) => {
  const bundledExtensionsEmitter = await di.inject(bundledExtensionsEventEmitterInjectable);
  const installedExtensions = await di.inject(installedExtensionsInjectable);
  const extensionsLoadedOnRenderer = await di.inject(rendererExtensionsLoadedInjectable);

  const areAllBundledExtensionsLoaded = () => {
    for (const extension of installedExtensions.values()) {
      if (!extension.isBundled) {
        continue;
      }

      if (!extensionsLoadedOnRenderer.has(extension.id)) {
        // There is bundled extension found by discovery that is not yet loaded on the renderer
        return false;
      }
    }

    /**
     * We know that all bundled extensions are found and added to `installedExtensions` in one go
     * because of how watch extensions is implemented.
     *
     * Search for EXTENSIONS-DISCOVERY-BUNDLED to find the code
     */
    return true;
  };

  return (extId) => {
    extensionsLoadedOnRenderer.add(extId);

    if (areAllBundledExtensionsLoaded()) {
      bundledExtensionsEmitter.emit("loaded");
    }
  };
});

export default extensionLoadedListenerInjectable;
