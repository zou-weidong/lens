/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { KubeAuthProxyDependencies } from "./kube-auth-proxy";
import { KubeAuthProxy } from "./kube-auth-proxy";
import type { Cluster } from "../../common/clusters/cluster";
import path from "path";
import directoryForBundledBinariesInjectable from "../../common/vars/directory-for-bundled-binaries.injectable";
import { getBinaryName } from "../utils";

const createKubeAuthProxyInjectable = getInjectable({
  id: "create-kube-auth-proxy",

  instantiate: (di) => {
    const kubeAuthProxyBinaryName = getBinaryName("lens-k8s-proxy");
    const dependencies: KubeAuthProxyDependencies = {
      proxyBinPath: path.join(di.inject(directoryForBundledBinariesInjectable), kubeAuthProxyBinaryName),
    };

    return (cluster: Cluster, environmentVariables: NodeJS.ProcessEnv) => (
      new KubeAuthProxy(dependencies, cluster, environmentVariables)
    );
  },
});

export default createKubeAuthProxyInjectable;
