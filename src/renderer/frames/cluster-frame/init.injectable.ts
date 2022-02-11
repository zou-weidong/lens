/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { initClusterFrame } from "./init";
import frameRoutingIdInjectable from "../../electron/frame-routing-id.injectable";
import appEventBusInjectable from "../../../common/app-event-bus/app-event-bus.injectable";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import hostedClusterInjectable from "../../clusters/hosted-cluster.injectable";
import clusterFrameLoggerInjectable from "./logger.injectable";
import setActiveEntityInjectable from "../../catalog/entity/set-active.injectable";
import loadExtensionsInjectable from "./load-extensions.injectable";
import setClusterFrameIdInjectable from "../../ipc/cluster/set-frame-id.injectable";

const initClusterFrameInjectable = getInjectable({
  instantiate: (di) => initClusterFrame({
    hostedCluster: di.inject(hostedClusterInjectable),
    loadExtensions: di.inject(loadExtensionsInjectable),
    setActiveEntity: di.inject(setActiveEntityInjectable),
    frameRoutingId: di.inject(frameRoutingIdInjectable),
    emitEvent: di.inject(appEventBusInjectable).emit,
    clusterFrameContext: di.inject(clusterFrameContextInjectable),
    logger: di.inject(clusterFrameLoggerInjectable),
    setClusterFrameId: di.inject(setClusterFrameIdInjectable),
  }),
  id: "init-cluster-frame",
});

export default initClusterFrameInjectable;
