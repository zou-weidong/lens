/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JsonObject } from "type-fest";
import type { Cluster } from "../../../common/clusters/cluster";
import type { LensLogger } from "../../../common/logger";
import { delay, getOrInsertWith } from "../../../common/utils";
import type { GetMetrics } from "../../k8s-api/get-metrics.injectable";
import getMetricsInjectable from "../../k8s-api/get-metrics.injectable";

import { getInjectable } from "@ogre-tools/injectable";
import metricsRouteLoggerInjectable from "./logger.injectable";

export type LoadMetrics = (promQueries: string[], cluster: Cluster, prometheusPath: string, queryParams: Record<string, string>) => Promise<JsonObject[]>;

interface Dependencies {
  getMetrics: GetMetrics;
  logger: LensLogger;
}

// prometheus metrics loader
const loadMetrics = ({
  getMetrics,
  logger,
}: Dependencies): LoadMetrics => (
  async (promQueries, cluster, prometheusPath, queryParams) => {
    const queries = promQueries.map(p => p.trim());
    const loaders = new Map<string, Promise<JsonObject>>();

    async function loadMetric(query: string) {
      async function loadMetricHelper() {
        for (let attempt = 1; attempt < 6; attempt += 1) { // retry
          try {
            return await getMetrics(cluster, prometheusPath, { query, ...queryParams });
          } catch (error) {
            if (error?.statusCode >= 400 && error?.statusCode < 500) {
              logger.error("metrics not available", error?.response ? error.response?.body : error);
              throw new Error("Metrics not available");
            }

            await delay(attempt * 1000);
          }
        }

        logger.error("metrics not available, too many attempt");
        throw new Error("Metrics not available, too many attempt");
      }

      return getOrInsertWith(loaders, query, loadMetricHelper);
    }

    return Promise.all(queries.map(loadMetric));
  }
);

const loadMetricsInjectable = getInjectable({
  instantiate: (di) => loadMetrics({
    getMetrics: di.inject(getMetricsInjectable),
    logger: di.inject(metricsRouteLoggerInjectable),
  }),
  id: "load-metrics",
});

export default loadMetricsInjectable;

