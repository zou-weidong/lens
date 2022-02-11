/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";

const isExtensionsInitiallyLoadedStateInjectable = getInjectable({
  instantiate: () => observable.box(false),
  id: "is-extensions-initially-loaded-state",
});

export default isExtensionsInitiallyLoadedStateInjectable;
