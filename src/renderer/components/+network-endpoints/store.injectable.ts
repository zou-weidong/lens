/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import endpointApiInjectable from "../../../common/k8s-api/endpoints/endpoint.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { EndpointStore } from "./store";

const endpointStoreInjectable = getInjectable({
  id: "endpoint-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(endpointApiInjectable);

    return new EndpointStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default endpointStoreInjectable;
