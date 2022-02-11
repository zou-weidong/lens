/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import apiBaseInjectable from "../k8s-api/api-base.injectable";
import portForwardingErrorNotificationInjectable from "./error-notification.injectable";
import portForwardStorageInjectable from "./storage.injectable";
import { PortForwardStore } from "./store";
import portForwardStoreLoggerInjectable from "./store-logger.injectable";

const portForwardStoreInjectable = getInjectable({
  instantiate: (di) => new PortForwardStore({
    storage: di.inject(portForwardStorageInjectable),
    apiBase: di.inject(apiBaseInjectable),
    logger: di.inject(portForwardStoreLoggerInjectable),
    portForwardingErrorNotification: di.inject(portForwardingErrorNotificationInjectable),
  }),
  id: "port-forward-store",
});

export default portForwardStoreInjectable;
