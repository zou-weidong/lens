/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { getBinaryName } from "../utils";

const kubectlBinaryNameInjectable = getInjectable({
  id: "kubectl-binary-name",
  instantiate: () => getBinaryName("kubectl"),
});

export default kubectlBinaryNameInjectable;
