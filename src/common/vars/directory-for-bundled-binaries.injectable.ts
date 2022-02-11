/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import { normalizedArch, normalizedPlatform } from ".";
import isProductionInjectable from "./is-production.injectable";
import resourcesPathInjectable from "./resources-path.injectable";

const directoryForBundledBinariesInjectable = getInjectable({
  id: "directory-for-bundled-binaries",
  instantiate: (di) => {
    const isProduction = di.inject(isProductionInjectable);
    const directoryParts = [di.inject(resourcesPathInjectable)];

    if (!isProduction) {
      directoryParts.push("binaries", "client", normalizedPlatform);
    }

    return path.join(...directoryParts, normalizedArch);
  },
});

export default directoryForBundledBinariesInjectable;
