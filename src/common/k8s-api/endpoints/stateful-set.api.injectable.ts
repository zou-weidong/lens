/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { StatefulSetApi } from "./stateful-set.api";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";

const statefulSetApiInjectable = getInjectable({
  id: "stateful-set-api",
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new StatefulSetApi();
  },
});

export default statefulSetApiInjectable;
