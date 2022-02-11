/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/clusters/cluster";
import directoryForTempInjectable from "../../common/paths/tempory-files.injectable";
import lensProxyPortInjectable from "../lens-proxy/port.injectable";
import { KubeconfigManager, KubeconfigManagerDependencies } from "./kubeconfig-manager";

export interface KubeConfigManagerInstantiationParameter {
  cluster: Cluster;
}

const createKubeconfigManagerInjectable = getInjectable({
  instantiate: (di) => {
    const dependencies: KubeconfigManagerDependencies = {
      directoryForTemp: di.inject(directoryForTempInjectable),
      proxyPort: di.inject(lensProxyPortInjectable),
    };

    return (cluster: Cluster) => new KubeconfigManager(dependencies, cluster);
  },
  id: "create-kubeconfig-manager",
});

export default createKubeconfigManagerInjectable;
