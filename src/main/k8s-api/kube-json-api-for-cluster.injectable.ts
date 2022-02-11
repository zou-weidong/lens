/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { kubeJsonApiForClusterInjectionToken } from "../../common/k8s-api/kube-json-api-for-cluster.token";
import kubeJsonApiLoggerInjectable from "../../common/k8s-api/kube-json-api-logger.injectable";
import { apiKubePrefix } from "../../common/vars";
import { KubeJsonApi } from "../../extensions/renderer-api/k8s-api";
import lensProxyPortInjectable from "../lens-proxy/port.injectable";

const kubeJsonApiForClusterInjectable = getInjectable({
  instantiate: (di) => {
    const proxyPort = di.inject(lensProxyPortInjectable);
    const logger = di.inject(kubeJsonApiLoggerInjectable);

    return (clusterId) => new KubeJsonApi({
      serverAddress: `http://127.0.0.1:${proxyPort.value}`,
      apiBase: apiKubePrefix,
      logger,
    }, {
      headers: {
        "Host": `${clusterId}.localhost:${proxyPort.value}`,
      },
    });
  },
  injectionToken: kubeJsonApiForClusterInjectionToken,
  id: "kube-json-api-for-cluster",
});

export default kubeJsonApiForClusterInjectable;
