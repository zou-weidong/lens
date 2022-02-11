/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { kubeObjectStoreToken } from "../../../../common/k8s-api/api-manager.injectable";
import customResourceDefinitionApiInjectable from "../../../../common/k8s-api/endpoints/custom-resource-definition.api.injectable";
import createStoresAndApisInjectable from "../../../vars/is-cluster-page-context.injectable";
import { CustomResourceDefinitionStore } from "./store";

const customResourceDefinitionStoreInjectable = getInjectable({
  id: "custom-resource-definition-store",
  instantiate: (di) => {
    const makeStore = di.inject(createStoresAndApisInjectable);

    if (!makeStore) {
      return undefined;
    }

    const api = di.inject(customResourceDefinitionApiInjectable);

    return new CustomResourceDefinitionStore(api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default customResourceDefinitionStoreInjectable;
