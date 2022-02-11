/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { JsonObject } from "type-fest";
import type { Cluster } from "../../common/clusters/cluster";
import type { IMetricsReqParams } from "../../common/k8s-api/endpoints";
import type { K8sRequest } from "./request.injectable";
import k8sRequestInjectable from "./request.injectable";

export type GetMetrics = (cluster: Cluster, prometheusPath: string, queryParams: IMetricsReqParams & { query: string }) => Promise<JsonObject>;

interface Dependencies {
  k8sRequest: K8sRequest;
}

const getMetrics = ({ k8sRequest }: Dependencies): GetMetrics => (
  (cluster, prometheusPath, queryParams) => {
    const prometheusPrefix = cluster.preferences.prometheus?.prefix || "";
    const metricsPath = `/api/v1/namespaces/${prometheusPath}/proxy${prometheusPrefix}/api/v1/query_range`;

    return k8sRequest(cluster, metricsPath, {
      timeout: 0,
      resolveWithFullResponse: false,
      method: "POST",
      form: queryParams,
    });
  }
);

const getMetricsInjectable = getInjectable({
  instantiate: (di) => getMetrics({
    k8sRequest: di.inject(k8sRequestInjectable),
  }),
  id: "get-metrics",
});

export default getMetricsInjectable;
