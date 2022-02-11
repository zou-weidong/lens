/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionInstallationStateManagerLoggerInjectable from "./logger.injectable";
import { ExtensionInstallationStateManager } from "./manager";

const extensionInstallationStateManagerInjectable = getInjectable({
  instantiate: (di) => new ExtensionInstallationStateManager({
    logger: di.inject(extensionInstallationStateManagerLoggerInjectable),
  }),
  id: "extension-installation-state-manager",
});

export default extensionInstallationStateManagerInjectable;
