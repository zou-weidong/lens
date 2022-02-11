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

interface Dependencies {
  createResourceApplier: CreateResourceApplier;
}

const applyResourceRoute = ({
  createResourceApplier,
}: Dependencies) => (
  async ({ cluster, payload }: LensApiRequest): Promise<LensApiResult<string>> => ({
    response: await createResourceApplier(cluster).apply(payload),
  })
);

const applyResourceRouteInjectable = getInjectable({
  id: "apply-resource-route",
  instantiate: (di): Route<string> => ({
    method: "post",
    path: `${apiPrefix}/stack`,
    handler: applyResourceRoute({
      createResourceApplier: di.inject(createResourceApplierInjectable),
    }),
  }),

  injectionToken: routeInjectionToken,
});

export default applyResourceRouteInjectable;
