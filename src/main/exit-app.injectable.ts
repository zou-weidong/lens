/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { app } from "electron";
import type { WindowManager } from "./window/manager";
import type { AppEventBus } from "../common/app-event-bus/event-bus";
import type { ClusterManager } from "./clusters/manager";
import logger from "./logger";
import { getInjectable } from "@ogre-tools/injectable";
import appEventBusInjectable from "../common/app-event-bus/app-event-bus.injectable";
import clusterManagerInjectable from "./clusters/manager.injectable";
import windowManagerInjectable from "./window/manager.injectable";

export type ExitApp = () => void;

interface Dependencies {
  appEventBus: AppEventBus;
  windowManager: WindowManager;
  clusterManager: ClusterManager;
}

const exitApp = ({ appEventBus, windowManager, clusterManager }: Dependencies) => (
  () => {
    appEventBus.emit({ name: "service", action: "close" });
    windowManager?.hide();
    clusterManager?.stop();
    logger.info("SERVICE:QUIT");
    setTimeout(() => {
      app.exit();
    }, 1000);
  }
);


const exitAppInjectable = getInjectable({
  instantiate: (di) => exitApp({
    appEventBus: di.inject(appEventBusInjectable),
    clusterManager: di.inject(clusterManagerInjectable),
    windowManager: di.inject(windowManagerInjectable),
  }),
  id: "exit-app",
});

export default exitAppInjectable;

