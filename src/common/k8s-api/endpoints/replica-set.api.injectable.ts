/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";
import { ReplicaSetApi } from "./replica-set.api";

const replicaSetApiInjectable = getInjectable({
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new ReplicaSetApi();
  },
  id: "replica-set-api",
});

export default replicaSetApiInjectable;
