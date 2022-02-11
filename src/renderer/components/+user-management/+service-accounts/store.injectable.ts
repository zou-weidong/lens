/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../../common/k8s-api/api-manager.injectable";
import serviceAccountApiInjectable from "../../../../common/k8s-api/endpoints/service-account.api.injectable";
import createStoresAndApisInjectable from "../../../vars/is-cluster-page-context.injectable";
import { ServiceAccountStore } from "./store";

const serviceAccountStoreInjectable = getInjectable({
  id: "service-account-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(serviceAccountApiInjectable);

    return new ServiceAccountStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default serviceAccountStoreInjectable;
