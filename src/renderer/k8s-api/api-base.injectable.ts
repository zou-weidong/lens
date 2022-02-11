/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import apiBaseLoggerInjectable from "../../common/k8s-api/api-base-logger.injectable";
import { apiBaseInjectionToken } from "../../common/k8s-api/api-base.token";
import { JsonApi } from "../../common/k8s-api/json-api";
import { apiPrefix } from "../../common/vars";
import errorNotificationInjectable from "../components/notifications/error.injectable";

const apiBaseInjectable = getInjectable({
  instantiate: (di) => {
    const errorNotification = di.inject(errorNotificationInjectable);
    const logger = di.inject(apiBaseLoggerInjectable);

    const apiBase = new JsonApi({
      serverAddress: `http://127.0.0.1:${window.location.port}`,
      apiBase: apiPrefix,
      logger,
    }, {
      headers: {
        "Host": window.location.host,
      },
    });

    apiBase.onError.addListener((error, res) => {
      switch (res.status) {
        case 403:
          error.isUsedForNotification = true;
          errorNotification(error);
          break;
      }
    });

    return apiBase;
  },
  injectionToken: apiBaseInjectionToken,
  id: "api-base",
});

export default apiBaseInjectable;
