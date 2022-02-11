/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager.injectable";
import { KubeApi } from "../../../../common/k8s-api/kube-api";
import { KubeObject } from "../../../../common/k8s-api/kube-object";
import { CustomResourceStore } from "../crd-resource.store";
import customResourceDefinitionsInjectable from "./list.injectable";

const ensureCustomResourceStoresAndApisInjectable = getInjectable({
  id: "ensure-custom-resource-stores-and-apis",
  setup: async (di) => {
    const customResourceDefinitions = await di.inject(customResourceDefinitionsInjectable);
    const apiManager = await di.inject(apiManagerInjectable);

    reaction(
      () => customResourceDefinitions.get(),
      (definitions) => {
        for (const definition of definitions) {
          const api = apiManager.getApi(definition.getResourceApiBase())
            ?? new KubeApi({
              objectConstructor: class extends KubeObject {
                static readonly kind = definition.getResourceKind();
                static readonly namespaced = definition.isNamespaced();
                static readonly apiBase = definition.getResourceApiBase();
              },
            });

          if (!apiManager.getStore(api)) {
            apiManager.registerStore(new CustomResourceStore(api));
          }
        }
      },
    );
  },
  instantiate: () => undefined,
});

export default ensureCustomResourceStoresAndApisInjectable;
