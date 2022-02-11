/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";
import { ClusterRoleApi } from "./cluster-role.api";

const clusterRoleApiInjectable = getInjectable({
  id: "cluster-role-api",
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new ClusterRoleApi();
  },
});

export default clusterRoleApiInjectable;
