/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiKubePrefix } from "../vars";
import isDevelopmentInjectable from "../vars/is-development.injectable";
import { apiBaseInjectionToken } from "./api-base.token";
import { type ILocalKubeApiConfig, KubeApi, type KubeApiConstructor } from "./kube-api";
import { KubeJsonApi } from "./kube-json-api";
import type { KubeObject, KubeObjectConstructor } from "./kube-object";

export interface KubeApiForCluster {
  <
    K extends KubeObject,
    A extends KubeApi<K>,
  > (
    cluster: ILocalKubeApiConfig,
    kubeClass: KubeObjectConstructor<K>,
    apiClass: KubeApiConstructor<A, K>,
  ): A;
  <
    K extends KubeObject,
  > (
    cluster: ILocalKubeApiConfig,
    kubeClass: KubeObjectConstructor<K>,
  ): KubeApi<K>;
}

const kubeApiForClusterInjectable = getInjectable({
  id: "kube-api-for-cluster",
  instantiate: (di) => {
    const apiBase = di.inject(apiBaseInjectionToken);
    const isDevelopment = di.inject(isDevelopmentInjectable);

    return ((cluster, kubeClass, apiClass) => {
      const url = new URL(apiBase.config.serverAddress);
      const request = new KubeJsonApi({
        serverAddress: apiBase.config.serverAddress,
        apiBase: apiKubePrefix,
        debug: isDevelopment,
      }, {
        headers: {
          "Host": `${cluster.metadata.uid}.localhost:${url.port}`,
        },
      });

      apiClass ??= KubeApi as never;

      return new apiClass({
        objectConstructor: kubeClass,
        request,
      });
    }) as KubeApiForCluster;
  },
});

export default kubeApiForClusterInjectable;
