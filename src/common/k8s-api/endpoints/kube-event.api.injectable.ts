/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";
import { KubeEventApi } from "./kube-event.api";

const kubeEventApiInjectable = getInjectable({
  id: "kube-event-api",
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new KubeEventApi();
  },
});

export default kubeEventApiInjectable;
