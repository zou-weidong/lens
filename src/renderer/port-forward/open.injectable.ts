/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensLogger } from "../../common/logger";
import type { ErrorNotification } from "../components/notifications/error.injectable";
import errorNotificationInjectable from "../components/notifications/error.injectable";
import { openExternal } from "../utils";
import type { ForwardedPort } from "./item";
import portForwardLoggerInjectable from "./logger.injectable";
import { portForwardAddress } from "./utils";

export type OpenPortForward = (portForward: ForwardedPort) => void;

interface Dependencies {
  logger: LensLogger;
  errorNotification: ErrorNotification;
}

const openPortForward = ({
  errorNotification,
  logger,
}: Dependencies): OpenPortForward => (
  (portForward) => {
    const browseTo = portForwardAddress(portForward);

    (async () => {
      try {
        await openExternal(browseTo);
      } catch (error) {
        logger.error(`failed to open in browser: ${error}`, {
          port: portForward.port,
          kind: portForward.kind,
          namespace: portForward.namespace,
          name: portForward.name,
        });
        errorNotification(`Failed to open ${browseTo} in browser`);
      }
    })();
  }
);

const openPortForwardInjectable = getInjectable({
  instantiate: (di) => openPortForward({
    errorNotification: di.inject(errorNotificationInjectable),
    logger: di.inject(portForwardLoggerInjectable),
  }),
  id: "open-port-forward",
});

export default openPortForwardInjectable;
