/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";
import { IngressApi } from "./ingress.api";

const ingressApiInjectable = getInjectable({
  id: "ingress-api",
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new IngressApi({
    // Add fallback for Kubernetes <1.19
      checkPreferredVersion: true,
      fallbackApiBases: ["/apis/extensions/v1beta1/ingresses"],
    });
  },
});

export default ingressApiInjectable;
