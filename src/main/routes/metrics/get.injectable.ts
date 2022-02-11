/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import Joi from "joi";
import type { ClusterPrometheusMetadata } from "../../../common/clusters/cluster-types";
import { ClusterMetadataKey } from "../../../common/clusters/cluster-types";
import type { IMetrics } from "../../../common/k8s-api/endpoints";
import type { LensLogger } from "../../../common/logger";
import { apiPrefix } from "../../../common/vars";
import type { Route, LensApiRequest, LensApiResult } from "../../router/router";
import { routeInjectionToken } from "../../router/router.injectable";
import { entries } from "../../utils";
import type { LoadMetrics } from "./load-metrics.injectable";
import loadMetricsInjectable from "./load-metrics.injectable";
import metricsRouteLoggerInjectable from "./logger.injectable";
import type { IMetricsQuery } from "./metrics-query";

interface Dependencies {
  loadMetrics: LoadMetrics;
  logger: LensLogger;
}

const oneQueryValidator = Joi.string();
const manyQueriesValidator = Joi.array().items(oneQueryValidator);
const namedQueryOptionsValidator = Joi.object<Record<string, Record<string, string>>, true>()
  .pattern(
    Joi.string(),
    Joi.object()
      .pattern(
        Joi.string(),
        oneQueryValidator,
      ),
  );

const getMetrics = ({
  loadMetrics,
  logger,
}: Dependencies) => (
  async ({ cluster, payload, query }: LensApiRequest): Promise<LensApiResult<IMetrics | IMetrics[] | Record<string, IMetrics>>> => {
    const queryParams: IMetricsQuery = Object.fromEntries(query.entries());
    const prometheusMetadata: ClusterPrometheusMetadata = {};

    try {
      const { prometheusPath, provider } = await cluster.contextHandler.getPrometheusDetails();

      prometheusMetadata.provider = provider?.id;
      prometheusMetadata.autoDetected = !cluster.preferences.prometheusProvider?.type;

      if (!prometheusPath) {
        prometheusMetadata.success = false;

        return { response: [] };
      }

      // return data in same structure as query

      {
        const query = oneQueryValidator.validate(payload);

        if (!query.error) {
          const [data] = await loadMetrics([query.value], cluster, prometheusPath, queryParams);

          return { response: data as unknown as IMetrics };
        }
      }

      {
        const queries = manyQueriesValidator.validate(payload);

        if (!queries.error) {
          const data = await loadMetrics(queries.value, cluster, prometheusPath, queryParams);

          return { response: data as unknown as IMetrics[] };
        }
      }

      {
        const queryOptions = namedQueryOptionsValidator.validate(payload);

        if (queryOptions.error) {
          return { error: queryOptions.error };
        }

        const queries = entries(queryOptions.value)
          .map(([queryName, queryOpts]) => (
            provider.getQuery(queryOpts, queryName)
          ));
        const result = await loadMetrics(queries, cluster, prometheusPath, queryParams);
        const data = Object.fromEntries(Object.keys(payload).map((metricName, i) => [metricName, result[i]]));

        prometheusMetadata.success = true;

        return { response: data as unknown as Record<string, IMetrics> };
      }
    } catch (error) {
      prometheusMetadata.success = false;

      logger.warn(`[METRICS-ROUTE]: failed to get metrics for clusterId=${cluster.id}:`, error);

      return { response: [] };
    } finally {
      cluster.metadata[ClusterMetadataKey.PROMETHEUS] = prometheusMetadata;
    }
  }
);

const getMetricsRouteInjectable = getInjectable({
  instantiate: (di): Route<IMetrics | IMetrics[] | Record<string, IMetrics>> => ({
    method: "post",
    path: `${apiPrefix}/metrics`,
    handler: getMetrics({
      loadMetrics: di.inject(loadMetricsInjectable),
      logger: di.inject(metricsRouteLoggerInjectable),
    }),
  }),
  injectionToken: routeInjectionToken,
  id: "get-metrics-route",
});

export default getMetricsRouteInjectable;
