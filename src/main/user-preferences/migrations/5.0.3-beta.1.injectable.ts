/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { existsSync, readFileSync } from "fs";
import path from "path";
import os from "os";
import type { ClusterStoreModel } from "../../../common/clusters/store";
import type { KubeconfigSyncEntry, UserPreferencesModel } from "../../../common/user-preferences";
import type { MigrationDeclaration } from "../../utils";
import { isLogicalChildPath } from "../../../common/utils";
import { getInjectable } from "@ogre-tools/injectable";
import directoryForKubeConfigsInjectable from "../../../common/paths/local-kube-configs.injectable";
import directoryForUserDataInjectable from "../../../common/paths/user-data.injectable";

interface Dependencies {
  userDataPath: string;
  kubeConfigsPath: string;
}

const version503Beta1 = ({ userDataPath, kubeConfigsPath }: Dependencies): MigrationDeclaration => ({
  version: "5.0.3-beta.1",
  run(log, store) {
    try {
      const { syncKubeconfigEntries = [], ...preferences }: UserPreferencesModel = store.get("preferences") ?? {};
      const { clusters = [] }: ClusterStoreModel = JSON.parse(readFileSync(path.resolve(userDataPath, "lens-cluster-store.json"), "utf-8")) ?? {};
      const extensionDataDir = path.resolve(userDataPath, "extension_data");
      const syncPaths = new Set(syncKubeconfigEntries.map(s => s.filePath));

      syncPaths.add(path.join(os.homedir(), ".kube"));

      for (const cluster of clusters) {
        if (!cluster.kubeConfigPath) {
          continue;
        }
        const dirOfKubeconfig = path.dirname(cluster.kubeConfigPath);

        if (dirOfKubeconfig === kubeConfigsPath) {
          log(`Skipping ${cluster.id} because kubeConfigPath is under the stored KubeConfig folder`);
          continue;
        }

        if (syncPaths.has(cluster.kubeConfigPath) || syncPaths.has(dirOfKubeconfig)) {
          log(`Skipping ${cluster.id} because kubeConfigPath is already being synced`);
          continue;
        }

        if (isLogicalChildPath(extensionDataDir, cluster.kubeConfigPath)) {
          log(`Skipping ${cluster.id} because kubeConfigPath is placed under an extension_data folder`);
          continue;
        }

        if (!existsSync(cluster.kubeConfigPath)) {
          log(`Skipping ${cluster.id} because kubeConfigPath no longer exists`);
          continue;
        }

        log(`Adding ${cluster.kubeConfigPath} from ${cluster.id} to sync paths`);
        syncPaths.add(cluster.kubeConfigPath);
      }

      const updatedSyncEntries: KubeconfigSyncEntry[] = [...syncPaths].map(filePath => ({ filePath }));

      log("Final list of synced paths", updatedSyncEntries);
      store.set("preferences", { ...preferences, syncKubeconfigEntries: updatedSyncEntries });
    } catch (error) {
      if (error.code !== "ENOENT") {
        // ignore files being missing
        throw error;
      }
    }
  },
});

const v503Beta1MigrationInjectable = getInjectable({
  instantiate: (di) => version503Beta1({
    kubeConfigsPath: di.inject(directoryForKubeConfigsInjectable),
    userDataPath: di.inject(directoryForUserDataInjectable),
  }),
  id: "user-preferences-store-v5.0.3-beta.1-migration",
});

export default v503Beta1MigrationInjectable;

