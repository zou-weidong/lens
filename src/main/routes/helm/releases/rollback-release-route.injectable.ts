/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { apiPrefix } from "../../../../common/vars";
import type { Route } from "../../../router/router";
import { helmService } from "../../../helm/helm-service";
import { routeInjectionToken } from "../../../router/router.injectable";
import { getInjectable } from "@ogre-tools/injectable";
import Joi from "joi";

const revisionValidator = Joi.number();

const rollbackReleaseRouteInjectable = getInjectable({
  id: "rollback-release-route",

  instantiate: (): Route<void> => ({
    method: "put",
    path: `${apiPrefix}/v2/releases/{namespace}/{release}/rollback`,

    handler: async ({ cluster, params, payload }) => {
      const revision = revisionValidator.validate(payload);

      if (revision.error) {
        return { error: revision.error };
      }

      await helmService.rollback(cluster, params.release, params.namespace, revision.value);

      return undefined;
    },
  }),

  injectionToken: routeInjectionToken,
});

export default rollbackReleaseRouteInjectable;
