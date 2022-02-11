/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { LensExtensionId } from "../../extensions/manifest";
import { getChannelEmitterInjectionToken } from "../channel";

export type ExtensionLoaded = (extId: LensExtensionId) => void;

export const extensionLoadedInjectionToken = getChannelEmitterInjectionToken<ExtensionLoaded>("extensions:loaded");

/**
 * This token is used for having the code loading extensions be agnostic of location but implement
 * it on one side as a noop.
 */
export const emitExtensionLoadedInjectionToken = getInjectionToken<ExtensionLoaded>({
  id: "emit-extension-loaded-token",
});
