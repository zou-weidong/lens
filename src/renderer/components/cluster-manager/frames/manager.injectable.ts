/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getClusterByIdInjectable from "../../../../common/clusters/get-by-id.injectable";
import clusterFrameLoggerInjectable from "../../../frames/cluster-frame/logger.injectable";
import setClusterAsVisibleInjectable from "../../../ipc/cluster/set-as-visible.injectable";
import { ClusterFramesManager } from "./manager";

const clusterFramesManagerInjectable = getInjectable({
  instantiate: (di) => new ClusterFramesManager({
    getClusterById: di.inject(getClusterByIdInjectable),
    logger: di.inject(clusterFrameLoggerInjectable),
    setClusterAsVisible: di.inject(setClusterAsVisibleInjectable),
  }),
  id: "cluster-frames-manager",
});

export default clusterFramesManagerInjectable;
