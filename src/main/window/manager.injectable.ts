/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import appEventBusInjectable from "../../common/app-event-bus/app-event-bus.injectable";
import isMacInjectable from "../../common/vars/is-mac.injectable";
import productNameInjectable from "../../common/vars/product-name.injectable";
import bundledExtensionsEventEmitterInjectable from "../extensions/bundled-loaded.injectable";
import windowManagerLoggerInjectable from "./logger.injectable";
import mainContentUrlInjectable from "./main-content-url.injectable";
import { WindowManager } from "./manager";

const windowManagerInjectable = getInjectable({
  id: "window-manager",
  instantiate: (di) => new WindowManager({
    appEventBus: di.inject(appEventBusInjectable),
    bundledExtensionsEmitter: di.inject(bundledExtensionsEventEmitterInjectable),
    mainContentUrl: di.inject(mainContentUrlInjectable),
    isMac: di.inject(isMacInjectable),
    logger: di.inject(windowManagerLoggerInjectable),
    productName: di.inject(productNameInjectable),
  }),
});

export default windowManagerInjectable;
