/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import type { LensApiRequest, LensApiResult, Route } from "../../router/router";
import { apiPrefix } from "../../../common/vars";
import type { CreateResourceApplier } from "../../kube-resources/create-applier.injectable";
import createResourceApplierInjectable from "../../kube-resources/create-applier.injectable";
import Joi from "joi";
import type { PatchResourceArgs } from "../../kube-resources/applier";

interface Dependencies {
  createResourceApplier: CreateResourceApplier;
}

const patchResourceValidator = Joi.object<PatchResourceArgs, true>({
  name: Joi
    .string()
    .required(),
  kind: Joi
    .string()
    .required(),
  patch: Joi
    .array()
    .allow(
      Joi.object({
        op: Joi
          .string()
          .allow("add", "remove", "replace", "move", "copy", "test")
          .only()
          .required(),
        path: Joi
          .string()
          .required(),
        from: Joi
          .string()
          .optional(),
        value: Joi
          .any()
          .optional(),
      }),
    )
    .required(),
  ns: Joi
    .string()
    .optional(),
});

const patchResourceRoute = ({
  createResourceApplier,
}: Dependencies) => (
  async ({ cluster, payload }: LensApiRequest): Promise<LensApiResult<string>> => {
    const request = patchResourceValidator.validate(payload);

    if (request.error) {
      return { error: request.error };
    }

    return {
      response: await createResourceApplier(cluster).patch(request.value),
    };
  }
);

const patchResourceRouteInjectable = getInjectable({
  id: "patch-resource-route",
  instantiate: (di): Route<string> => ({
    method: "patch",
    path: `${apiPrefix}/stack`,
    handler: patchResourceRoute({
      createResourceApplier: di.inject(createResourceApplierInjectable),
    }),
  }),

  injectionToken: routeInjectionToken,
});

export default patchResourceRouteInjectable;
