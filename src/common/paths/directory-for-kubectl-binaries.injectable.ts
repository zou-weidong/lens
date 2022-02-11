/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForBinariesInjectable from "./binaries.injectable";
import path from "path";

const directoryForKubectlBinariesInjectable = getInjectable({
  instantiate: (di) => path.join(di.inject(directoryForBinariesInjectable), "kubectl"),
  id: "directory-for-kubectl-binaries",
});

export default directoryForKubectlBinariesInjectable;
