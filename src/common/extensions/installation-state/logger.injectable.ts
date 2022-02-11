/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../../logger/child-logger.injectable";

const extensionInstallationStateManagerLoggerInjectable = getInjectable({
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "EXTENSION-INSTALLATION-STATE-MANAGER",
  }),
  id: "extension-installation-state-manager-logger",
});

export default extensionInstallationStateManagerLoggerInjectable;
