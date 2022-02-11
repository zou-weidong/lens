/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import getClusterForRequestInjectable from "../clusters/get-cluster-for-request.injectable";
import { kubeApiRequest } from "./handlers";
import shellApiRequestInjectable from "./handlers/shell-api-request/shell-api-request.injectable";
import routerInjectable from "../router/router.injectable";
import lensProxyLoggerInjectable from "./logger.injectable";
import lensProxyPortInjectable from "./port.injectable";
import { LensProxy } from "./proxy";
import proxyServerInjectable from "./server.injectable";

const lensProxyInjectable = getInjectable({
  instantiate: (di) => new LensProxy({
    appEventBus: di.inject(appEventBusInjectable),
    router: di.inject(routerInjectable),
    getClusterForRequest: di.inject(getClusterForRequestInjectable),
    kubeApiRequest,
    shellApiRequest: di.inject(shellApiRequestInjectable),
    logger: di.inject(lensProxyLoggerInjectable),
    proxyPort: di.inject(lensProxyPortInjectable),
    proxy: di.inject(proxyServerInjectable),
  }),
  id: "lens-proxy",
});

export default lensProxyInjectable;
