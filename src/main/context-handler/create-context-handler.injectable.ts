/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Cluster } from "../../common/clusters/cluster";
import { ContextHandler, ContextHandlerDependencies } from "./context-handler";
import createKubeAuthProxyInjectable from "../kube-auth-proxy/create-kube-auth-proxy.injectable";

const createContextHandlerInjectable = getInjectable({
  instantiate: (di) => {
    const dependencies: ContextHandlerDependencies = {
      createKubeAuthProxy: di.inject(createKubeAuthProxyInjectable),
    };

    return (cluster: Cluster) => new ContextHandler(dependencies, cluster);
  },
  id: "create-context-handler",
});

export default createContextHandlerInjectable;
