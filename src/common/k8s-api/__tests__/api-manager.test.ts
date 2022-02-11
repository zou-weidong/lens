/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getDiForUnitTesting } from "../../../main/getDiForUnitTesting";
import type { IngressStore } from "../../../renderer/components/+network-ingresses/store";
import ingressStoreInjectable from "../../../renderer/components/+network-ingresses/store.injectable";
import type { ApiManager } from "../api-manager";
import apiManagerInjectable from "../api-manager.injectable";
import { KubeApi } from "../kube-api";
import { KubeObject } from "../kube-object";

class TestApi extends KubeApi<KubeObject> {

  protected async checkPreferredVersion() {
    return;
  }
}

describe("ApiManager", () => {
  let apiManager: ApiManager;
  let ingressStore: IngressStore;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    apiManager = di.inject(apiManagerInjectable);
    ingressStore = di.inject(ingressStoreInjectable);
  });

  describe("registerApi", () => {
    it("re-register store if apiBase changed", async () => {
      const apiBase = "apis/v1/foo";
      const fallbackApiBase = "/apis/extensions/v1beta1/foo";
      const kubeApi = new TestApi({
        objectConstructor: KubeObject,
        apiBase,
        fallbackApiBases: [fallbackApiBase],
        checkPreferredVersion: true,
      });

      apiManager.registerApi(apiBase, kubeApi);

      // Define to use test api for ingress store
      Object.defineProperty(ingressStore, "api", { value: kubeApi });
      apiManager.registerStore(ingressStore, [kubeApi]);

      // Test that store is returned with original apiBase
      expect(apiManager.getStore(kubeApi)).toBe(ingressStore);

      // Change apiBase similar as checkPreferredVersion does
      Object.defineProperty(kubeApi, "apiBase", { value: fallbackApiBase });
      apiManager.registerApi(fallbackApiBase, kubeApi);

      // Test that store is returned with new apiBase
      expect(apiManager.getStore(kubeApi)).toBe(ingressStore);
    });
  });
});
