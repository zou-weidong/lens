/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import type { LensApiRequest, LensApiResult, Route } from "../../router/router";
import { apiPrefix } from "../../../common/vars";
import { PortForward } from "./functionality/port-forward";
import type { LensLogger } from "../../../common/logger";
import portForwardRouteLoggerInjectable from "./logger.injectable";

interface Dependencies {
  logger: LensLogger;
}

const stopCurrentPortForward = ({
  logger,
}: Dependencies) => (
  async (request: LensApiRequest): Promise<LensApiResult<StopCurrentPortFowardData>> => {
    const { params, query, cluster } = request;
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));

    const portForward = PortForward.getPortforward({
      clusterId: cluster.id, kind: resourceType, name: resourceName,
      namespace, port, forwardPort,
    });

    try {
      await portForward.stop();

      return { response: { status: true }};
    } catch (error) {
      logger.error("error stopping a port-forward", { namespace, port, forwardPort, resourceType, resourceName });

      return {
        error: {
          message: `error stopping a forward port ${port}`,
        },
      };

    }
  }
);

export interface StopCurrentPortFowardData {
  status: boolean;
}

const stopCurrentPortForwardRouteInjectable = getInjectable({
  id: "stop-current-port-forward-route",

  instantiate: (di): Route<StopCurrentPortFowardData> => ({
    method: "delete",
    path: `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`,
    handler: stopCurrentPortForward({
      logger: di.inject(portForwardRouteLoggerInjectable),
    }),
  }),

  injectionToken: routeInjectionToken,
});

export default stopCurrentPortForwardRouteInjectable;
