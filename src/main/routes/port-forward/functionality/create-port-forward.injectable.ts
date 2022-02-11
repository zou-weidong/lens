/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PortForwardArgs, PortForwardDependencies } from "./port-forward";
import { PortForward } from "./port-forward";
import bundledKubectlInjectable from "../../../kubectl/bundled-kubectl.injectable";

export type CreatePortForward = (pathToKubeConfig: string, args: PortForwardArgs) => PortForward;

const createPortForwardInjectable = getInjectable({
  id: "create-port-forward",
  instantiate: (di): CreatePortForward => {
    const deps: PortForwardDependencies = {
      getKubectlBinPath: di.inject(bundledKubectlInjectable).getPath,
    };

    return (kubeconfigPath, args) => new PortForward(deps, kubeconfigPath, args);
  },
});

export default createPortForwardInjectable;
