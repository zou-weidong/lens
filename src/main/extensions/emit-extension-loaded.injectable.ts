/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { emitExtensionLoadedInjectionToken } from "../../common/ipc/extensions/loaded.token";
import { noop } from "../../common/utils";

const emitExtensionLoadedInjectable = getInjectable({
  instantiate: () => noop,
  injectionToken: emitExtensionLoadedInjectionToken,
  id: "emit-extension-loaded",
});

export default emitExtensionLoadedInjectable;
