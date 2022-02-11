/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import { KubeJsonApi } from "../../common/k8s-api/kube-json-api";
import { apiKubePrefix } from "../../common/vars";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import errorNotificationInjectable from "../components/notifications/error.injectable";
import createStoresAndApisInjectable from "../vars/is-cluster-page-context.injectable";

const apiKubeInjectable = getInjectable({
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectable);

    if (!makeApi) {
      return undefined;
    }

    const isDevelopment = di.inject(isDevelopmentInjectable);
    const errorNotification = di.inject(errorNotificationInjectable);
    const apiKube = new KubeJsonApi({
      serverAddress: `http://127.0.0.1:${window.location.port}`,
      apiBase: apiKubePrefix,
      debug: isDevelopment,
    }, {
      headers: {
        "Host": window.location.host,
      },
    });

    apiKube.onError.addListener((error, res) => {
      switch (res.status) {
        case 403:
          error.isUsedForNotification = true;
          errorNotification(error);
          break;
      }
    });

    return apiKube;
  },
  id: "api_kube",
});

export default apiKubeInjectable;
