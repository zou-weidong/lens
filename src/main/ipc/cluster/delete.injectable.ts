/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import directoryForLensLocalStorageInjectable from "../../../common/paths/local-storage.injectable";
import deleteClusterByIdInjectable from "../../../common/clusters/delete-by-id.injectable";
import getClusterByIdInjectable from "../../../common/clusters/get-by-id.injectable";
import removeInjectable from "../../../common/fs/remove.injectable";
import { deleteClusterInjectionToken } from "../../../common/ipc/cluster/delete.token";
import clusterFramesInjectable from "../../clusters/frames.injectable";
import { implWithHandle } from "../impl-channel";

const deleteClusterInjectable = implWithHandle(deleteClusterInjectionToken, async (di) => {
  const getClusterById = await di.inject(getClusterByIdInjectable);
  const deleteClusterById = await di.inject(deleteClusterByIdInjectable);
  const clusterFrames = await di.inject(clusterFramesInjectable);
  const remove = await di.inject(removeInjectable);
  const localStorage = await di.inject(directoryForLensLocalStorageInjectable);

  return async (clusterId) => {
    const cluster = getClusterById(clusterId);

    if (!cluster) {
      return;
    }

    cluster.disconnect();
    clusterFrames.delete(cluster.id);

    // Remove from the cluster store as well, this should clear any old settings
    deleteClusterById(cluster.id);

    try {
      // remove the local storage file
      await remove(path.resolve(localStorage, `${cluster.id}.json`));
    } catch {
      // ignore error
    }
  };
});

export default deleteClusterInjectable;
