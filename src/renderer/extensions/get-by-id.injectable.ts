/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { LensRendererExtension } from "../../extensions/lens-renderer-extension";
import extensionInstancesInjectable from "../../common/extensions/instances.injectable";

export type GetExtensionById = (extId: string) => LensRendererExtension | undefined;

const getExtensionByIdInjectable = getInjectable({
  instantiate: (di): GetExtensionById => {
    const state = di.inject(extensionInstancesInjectable);

    return (extId) => state.get(extId) as LensRendererExtension;
  },
  id: "get-extension-by-id",
});

export default getExtensionByIdInjectable;
