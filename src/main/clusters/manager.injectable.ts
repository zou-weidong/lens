/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import findEntitiesByClassInjectable from "../../common/catalog/entity/find-by-class.injectable";
import findEntityByIdInjectable from "../../common/catalog/entity/find-by-id.injectable";
import { ClusterManager } from "./manager";
import clusterManagerLoggerInjectable from "./manager-logger.injectable";
import clusterStoreInjectable from "./store.injectable";

const clusterManagerInjectable = getInjectable({
  instantiate: (di) => new ClusterManager({
    store: di.inject(clusterStoreInjectable),
    findEntitiesByClass: di.inject(findEntitiesByClassInjectable),
    findEntityById: di.inject(findEntityByIdInjectable),
    logger: di.inject(clusterManagerLoggerInjectable),
  }),
  id: "cluster-manager",
});

export default clusterManagerInjectable;
