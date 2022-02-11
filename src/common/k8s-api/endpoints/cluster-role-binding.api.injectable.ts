/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";
import { ClusterRoleBindingApi } from "./cluster-role-binding.api";

const clusterRoleBindingApiInjectable = getInjectable({
  id: "cluster-role-binding-api",
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new ClusterRoleBindingApi();
  },
});

export default clusterRoleBindingApiInjectable;
