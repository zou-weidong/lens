/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { routeInjectionToken } from "../../router/router.injectable";
import type { Route, LensApiRequest, LensApiResult } from "../../router/router";
import { apiPrefix } from "../../../common/vars";
import { PortForward } from "./functionality/port-forward";
import type { CreatePortForward } from "./functionality/create-port-forward.injectable";
import createPortForwardInjectable from "./functionality/create-port-forward.injectable";
import type { LensLogger } from "../../../common/logger";
import portForwardRouteLoggerInjectable from "./logger.injectable";

interface Dependencies {
  createPortForward: CreatePortForward;
  logger: LensLogger;
}

export interface StartPortFowardData {
  port: number;
}

const startPortForward = ({
  createPortForward,
  logger,
}: Dependencies) => (
  async ({ params, query, cluster }: LensApiRequest): Promise<LensApiResult<StartPortFowardData>> => {
    const { namespace, resourceType, resourceName } = params;
    const port = Number(query.get("port"));
    const forwardPort = Number(query.get("forwardPort"));

    try {
      let portForward = PortForward.getPortforward({
        clusterId: cluster.id,
        kind: resourceType,
        name: resourceName,
        namespace,
        port,
        forwardPort,
      });

      if (!portForward) {
        logger.info(
          `Creating a new port-forward ${namespace}/${resourceType}/${resourceName}:${port}`,
        );

        const thePort = 0 < forwardPort && forwardPort < 65536 ? forwardPort : 0;

        portForward = createPortForward(await cluster.getProxyKubeconfigPath(), {
          clusterId: cluster.id,
          kind: resourceType,
          namespace,
          name: resourceName,
          port,
          forwardPort: thePort,
        });

        const started = await portForward.start();

        if (!started) {
          logger.error("failed to start a port-forward", {
            namespace,
            port,
            resourceType,
            resourceName,
          });

          return {
            error: {
              message: `Failed to forward port ${port} to ${thePort ? forwardPort : "random port"}`,
            },
          };
        }
      }

      return { response: { port: portForward.forwardPort }};
    } catch (error) {
      logger.error(
        `failed to open a port-forward: ${error}`,
        { namespace, port, resourceType, resourceName },
      );

      return {
        error: {
          message: `Failed to forward port ${port}`,
        },
      };
    }
  }
);

const startPortForwardRouteInjectable = getInjectable({
  id: "start-current-port-forward-route",

  instantiate: (di): Route<{ port: number }> => ({
    method: "post",
    path: `${apiPrefix}/pods/port-forward/{namespace}/{resourceType}/{resourceName}`,
    handler: startPortForward({
      createPortForward: di.inject(createPortForwardInjectable),
      logger: di.inject(portForwardRouteLoggerInjectable),
    }),
  }),

  injectionToken: routeInjectionToken,
});

export default startPortForwardRouteInjectable;
