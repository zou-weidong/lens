/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../../common/k8s-api/api-manager.injectable";
import roleApiInjectable from "../../../../common/k8s-api/endpoints/role.api.injectable";
import createStoresAndApisInjectable from "../../../vars/is-cluster-page-context.injectable";
import { RoleStore } from "./store";

const roleStoreInjectable = getInjectable({
  id: "role-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(roleApiInjectable);

    return  new RoleStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default roleStoreInjectable;
