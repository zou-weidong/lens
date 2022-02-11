/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getInstanceByNameInjectable from "../../common/extensions/get-instance-by-name.injectable";
import isExtensionEnabledInjectable from "../../common/extensions/preferences/is-enabled.injectable";
import protocolHandlerRouterLoggerInjectable from "../../common/protocol-handler/router-logger.injectable";
import { lensProcessInjectionToken } from "../../common/vars/process.token";
import shortInfoNotificationInjectable from "../components/notifications/short-info.injectable";
import { LensProtocolRouterRenderer } from "./router";

const lensProtocolRouterRendererInjectable = getInjectable({
  instantiate: (di) => new LensProtocolRouterRenderer({
    shortInfoNotification: di.inject(shortInfoNotificationInjectable),
    logger: di.inject(protocolHandlerRouterLoggerInjectable),
    getInstanceByName: di.inject(getInstanceByNameInjectable),
    isExtensionEnabled: di.inject(isExtensionEnabledInjectable),
    lensProcess: di.inject(lensProcessInjectionToken),
  }),
  id: "lens-protocol-router-renderer",
});

export default lensProtocolRouterRendererInjectable;
