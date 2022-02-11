/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../common/k8s-api/api-manager.injectable";
import limitRangeApiInjectable from "../../../common/k8s-api/endpoints/limit-range.api.injectable";
import createStoresAndApisInjectable from "../../vars/is-cluster-page-context.injectable";
import { LimitRangeStore } from "./store";

const limitRangeStoreInjectable = getInjectable({
  id: "limit-range-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(limitRangeApiInjectable);

    return new LimitRangeStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default limitRangeStoreInjectable;
