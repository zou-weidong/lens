/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { Route } from "../../../router/router";
import type { InstallChartData } from "../../../helm/helm-service";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import Joi from "joi";

interface InstallChartResponse {
  log: string;
  release: { name: string; namespace: string };
}

const installChartDataValidator = Joi.object<InstallChartData, true>({
  chart: Joi
    .string()
    .required(),
  name: Joi
    .string()
    .required(),
  namespace: Joi
    .string()
    .required(),
  version: Joi
    .string()
    .required(),
  values: Joi
    .object()
    .pattern(Joi.string(), Joi.any())
    .required(),
});

const installChartRouteInjectable = getInjectable({
  id: "install-chart-route",

  instantiate: () : Route<InstallChartResponse> => ({
    method: "post",
    path: `${apiPrefix}/v2/releases`,

    handler: async ({ payload, cluster }) => {
      const data = installChartDataValidator.validate(payload);

      if (data.error) {
        return { error: data.error };
      }

      return {
        response: await helmService.installChart(cluster, data.value),
        statusCode: 201,
      };
    },
  }),

  injectionToken: routeInjectionToken,
});

export default installChartRouteInjectable;
