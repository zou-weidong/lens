/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import { getBinaryName } from "../utils";
import directoryForBundledBinariesInjectable from "./directory-for-bundled-binaries.injectable";

const bundledHelmBinaryPathInjectable = getInjectable({
  id: "bundled-helm-binary-path",
  instantiate: (di) => path.join(
    di.inject(directoryForBundledBinariesInjectable),
    getBinaryName("helm"),
  ),
});

export default bundledHelmBinaryPathInjectable;
