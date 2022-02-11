/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import path from "path";
import fse from "fs-extra";
import type { ClusterModel } from "../../../common/clusters/cluster-types";
import type { MigrationDeclaration } from "../../utils";
import { getInjectable } from "@ogre-tools/injectable";
import directoryForUserDataInjectable from "../../../common/paths/user-data.injectable";

interface Pre500WorkspaceStoreModel {
  workspaces: {
    id: string;
    name: string;
  }[];
}

interface Dependencies {
  userDataPath: string;
}

const v500Beta10Migration = ({ userDataPath }: Dependencies): MigrationDeclaration => ({
  version: "5.0.0-beta.10",
  run(log, store) {
    try {
      const workspaceData: Pre500WorkspaceStoreModel = fse.readJsonSync(path.join(userDataPath, "lens-workspace-store.json"));
      const workspaces = new Map<string, string>(); // mapping from WorkspaceId to name

      for (const { id, name } of workspaceData.workspaces) {
        workspaces.set(id, name);
      }

      const clusters: ClusterModel[] = store.get("clusters") ?? [];

      for (const cluster of clusters) {
        if (cluster.workspace && workspaces.has(cluster.workspace)) {
          cluster.labels ??= {};
          cluster.labels.workspace = workspaces.get(cluster.workspace);
        }
      }

      store.set("clusters", clusters);
    } catch (error) {
      if (!(error.code === "ENOENT" && error.path.endsWith("lens-workspace-store.json"))) {
        // ignore lens-workspace-store.json being missing
        throw error;
      }
    }
  },
});

const v500Beta10MigrationInjectable = getInjectable({
  instantiate: (di) => v500Beta10Migration({
    userDataPath: di.inject(directoryForUserDataInjectable),
  }),
  id: "cluster-store-v5.0.0-beta.10-migration",
});

export default v500Beta10MigrationInjectable;

