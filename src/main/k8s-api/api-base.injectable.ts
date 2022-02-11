/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import apiBaseLoggerInjectable from "../../common/k8s-api/api-base-logger.injectable";
import { apiBaseInjectionToken } from "../../common/k8s-api/api-base.token";
import { JsonApi } from "../../common/k8s-api/json-api";
import { apiPrefix } from "../../common/vars";
import lensProxyPortInjectable from "../lens-proxy/port.injectable";

let apiBase: JsonApi;

const apiBaseInjectable = getInjectable({
  setup: async (di) => {
    const proxyPort = await di.inject(lensProxyPortInjectable);
    const logger = await di.inject(apiBaseLoggerInjectable);

    proxyPort.whenSet(port => {
      apiBase = new JsonApi({
        serverAddress: `http://127.0.0.1:${port}`,
        apiBase: apiPrefix,
        logger,
      }, {
        headers: {
          "Host": `localhost:${port}`,
        },
      });
    });
  },
  instantiate: () => apiBase,
  injectionToken: apiBaseInjectionToken,
  id: "api-base",
});

export default apiBaseInjectable;
