/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { LensExtensionId } from "../../../common/extensions/manifest";

// NOTE: this will need to be changed to track window IDs when multiple window support is added
const rendererExtensionsLoadedInjectable = getInjectable({
  instantiate: () => observable.set<LensExtensionId>(),
  id: "renderer-extensions-loaded",
});

export default rendererExtensionsLoadedInjectable;
