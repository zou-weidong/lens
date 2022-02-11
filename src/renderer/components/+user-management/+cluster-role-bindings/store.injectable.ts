/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../../common/k8s-api/api-manager.injectable";
import clusterRoleBindingApiInjectable from "../../../../common/k8s-api/endpoints/cluster-role-binding.api.injectable";
import createStoresAndApisInjectable from "../../../vars/is-cluster-page-context.injectable";
import { ClusterRoleBindingStore } from "./store";

const clusterRoleBindingStoreInjectable = getInjectable({
  id: "cluster-role-binding-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(clusterRoleBindingApiInjectable);

    return new ClusterRoleBindingStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default clusterRoleBindingStoreInjectable;
