/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import enabledInstancesInjectable from "../common/extensions/enabled-instances.injectable";
import type { LensRendererExtension } from "./lens-renderer-extension";

const rendererExtensionsInjectable = getInjectable({
  id: "renderer-extensions",
  instantiate: (di) => di.inject(enabledInstancesInjectable) as IComputedValue<LensRendererExtension[]>,
});

export default rendererExtensionsInjectable;
