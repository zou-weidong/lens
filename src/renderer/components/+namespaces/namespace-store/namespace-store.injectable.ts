/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { NamespaceStore } from "./namespace.store";
import { kubeObjectStoreToken } from "../../../../common/k8s-api/api-manager.injectable";
import selectedNamespacesStorageInjectable from "./storage.injectable";
import namespaceApiInjectable from "../../../../common/k8s-api/endpoints/namespace.api.injectable";

const namespaceStoreInjectable = getInjectable({
  id: "namespace-store",

  instantiate: (di) => {
    const api = di.inject(namespaceApiInjectable);

    return new NamespaceStore({
      storage: di.inject(selectedNamespacesStorageInjectable),
    }, api);
  },
  injectionToken: kubeObjectStoreToken,
});

export default namespaceStoreInjectable;
