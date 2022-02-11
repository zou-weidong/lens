/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { Route } from "../../../router/router";
import type { UpdateReleaseData } from "../../../helm/helm-service";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import Joi from "joi";

interface UpdateReleaseResponse {
  log: string;
  release: { name: string; namespace: string };
}

const updateReleaseDataValidator = Joi.object<UpdateReleaseData, true>({
  chart: Joi
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

const updateReleaseRouteInjectable = getInjectable({
  id: "update-release-route",

  instantiate: (): Route<UpdateReleaseResponse> => ({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}`,

    handler: async ({ cluster, params, payload }) => {
      const data = updateReleaseDataValidator.validate(payload);

      if (data.error) {
        return { error: data.error };
      }

      return {
        response: await helmService.updateRelease(
          cluster,
          params.release,
          params.namespace,
          data.value,
        ),
      };
    },
  }),

  injectionToken: routeInjectionToken,
});

export default updateReleaseRouteInjectable;
