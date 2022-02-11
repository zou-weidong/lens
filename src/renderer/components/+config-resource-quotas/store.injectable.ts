/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import resourceQuotaApiInjectable from "../../../common/k8s-api/endpoints/resource-quota.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { ResourceQuotaStore } from "./store";

const resourceQuotaStoreInjectable = getInjectable({
  id: "resource-quota-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(resourceQuotaApiInjectable);

    return new ResourceQuotaStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default resourceQuotaStoreInjectable;
