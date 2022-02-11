/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { JsonObject } from "type-fest";
import type { Cluster } from "../../common/clusters/cluster";
import lensProxyPortInjectable from "../lens-proxy/port.injectable";
import type { RequestPromiseOptions } from "request-promise-native";
import request from "request-promise-native";
import { apiKubePrefix } from "../../common/vars";

export type K8sRequest = (cluster: Cluster, path: string, options?: RequestPromiseOptions) => Promise<JsonObject>;

const k8sRequestInjectable = getInjectable({
  instantiate: (di): K8sRequest => {
    const proxyPort = di.inject(lensProxyPortInjectable);

    return (cluster, path, options = {}) => {
      const kubeProxyUrl = `http://localhost:${proxyPort.value}${apiKubePrefix}`;

      options.headers ??= {};
      options.timeout ??= 30000;
      options.json = true; // for JSON
      options.headers.Host = `${cluster.id}.${new URL(kubeProxyUrl).host}`; // required in ClusterManager.getClusterForRequest()

      return request(kubeProxyUrl + path, options);
    };
  },
  id: "k8s-request",
});

export default k8sRequestInjectable;
