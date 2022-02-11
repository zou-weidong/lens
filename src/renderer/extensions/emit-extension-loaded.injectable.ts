/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { emitExtensionLoadedInjectionToken } from "../../common/ipc/extensions/loaded.token";
import extensionLoadedInjectable from "../ipc/extensions/loaded.injectable";

const emitExtensionLoadedInjectable = getInjectable({
  instantiate: (di) => di.inject(extensionLoadedInjectable),
  injectionToken: emitExtensionLoadedInjectionToken,
  id: "emit-extension-loaded",
});

export default emitExtensionLoadedInjectable;
