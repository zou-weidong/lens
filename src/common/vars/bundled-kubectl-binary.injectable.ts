/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import directoryForBundledBinariesInjectable from "./directory-for-bundled-binaries.injectable";
import kubectlBinaryNameInjectable from "./kubectl-binary-name.injectable";

const bundledKubectlBinaryPathInjectable = getInjectable({
  id: "bundled-kubectl-binary-path",
  instantiate: (di) => path.join(
    di.inject(directoryForBundledBinariesInjectable),
    di.inject(kubectlBinaryNameInjectable),
  ),
});

export default bundledKubectlBinaryPathInjectable;
