/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { NamespaceApi } from "./namespace.api";
import { createStoresAndApisInjectionToken } from "../../vars/create-stores-apis.token";

const namespaceApiInjectable = getInjectable({
  id: "namespace-api",
  instantiate: (di) => {
    const makeApi = di.inject(createStoresAndApisInjectionToken);

    if (!makeApi) {
      return undefined;
    }

    return new NamespaceApi();
  },
});

export default namespaceApiInjectable;
