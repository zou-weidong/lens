/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ObservableMap } from "mobx";
import type { CatalogEntity } from "../../../../common/catalog/entity";
import type { Cluster } from "../../../../common/clusters/cluster";
import { getInjectable } from "@ogre-tools/injectable";
import { loadConfigFromString } from "../../../../common/k8s/helpers";
import type { LensLogger } from "../../../../common/logger";
import type { ConfigToModels } from "./config-to-models.injectable";
import type { ClearAsDeleting } from "../../../clusters/clear-as-deleting.injectable";
import { createHash } from "crypto";
import { catalogEntityFromCluster } from "../../../clusters/manager";
import type { CreateCluster } from "../../../../common/clusters/create-cluster-injection-token";
import type { GetClusterById } from "../../../../common/clusters/get-by-id.injectable";
import { homedir } from "os";
import clearAsDeletingInjectable from "../../../clusters/clear-as-deleting.injectable";
import configToModelsInjectable from "./config-to-models.injectable";
import createClusterInjectable from "../../../clusters/create-cluster.injectable";
import directoryForKubeConfigsInjectable from "../../../../common/paths/local-kube-configs.injectable";
import getClusterByIdInjectable from "../../../../common/clusters/get-by-id.injectable";
import kubeconfigSyncManagerLoggerInjectable from "./logger.injectable";

export type RootSourceValue = [Cluster, CatalogEntity];
export type RootSource = ObservableMap<string, RootSourceValue>;
export type ComputeDiff = (contents: string, source: RootSource, filePath: string) => void;

interface Dependencies {
  logger: LensLogger;
  directoryForKubeConfigs: string;
  configToModels: ConfigToModels;
  clearAsDeleting: ClearAsDeleting;
  getClusterById: GetClusterById;
  createCluster: CreateCluster;
}

const computeDiff = ({
  logger,
  configToModels,
  getClusterById,
  clearAsDeleting,
  createCluster,
  directoryForKubeConfigs,
}: Dependencies): ComputeDiff => (
  (contents, source, filePath) => {
    try {
      const { config, error } = loadConfigFromString(contents);

      if (error) {
        logger.warn(`encountered errors while loading config: ${error.message}`, { filePath, details: error.details });
      }

      const rawModels = configToModels(config, filePath);
      const models = new Map(rawModels.map(m => [m.contextName, m]));

      logger.debug(`File now has ${models.size} entries`, { filePath });

      for (const [contextName, value] of source) {
        const model = models.get(contextName);

        // remove and disconnect clusters that were removed from the config
        if (!model) {
          // remove from the deleting set, so that if a new context of the same name is added, it isn't marked as deleting
          clearAsDeleting(value[0].id);

          value[0].disconnect();
          source.delete(contextName);
          logger.debug(`Removed old cluster from sync`, { filePath, contextName });
          continue;
        }

        // TODO: For the update check we need to make sure that the config itself hasn't changed.
        // Probably should make it so that cluster keeps a copy of the config in its memory and
        // diff against that
        // or update the model and mark it as not needed to be added
        value[0].updateModel(model);
        models.delete(contextName);
        logger.debug(`Updated old cluster from sync`, { filePath, contextName });
      }

      for (const [contextName, model] of models) {
        // add new clusters to the source
        try {
          const clusterId = createHash("md5").update(`${filePath}:${contextName}`).digest("hex");

          const cluster = getClusterById(clusterId) || createCluster({ ...model, id: clusterId });

          if (!cluster.apiUrl) {
            throw new Error("Cluster constructor failed, see above error");
          }

          const entity = catalogEntityFromCluster(cluster);

          if (!filePath.startsWith(directoryForKubeConfigs)) {
            entity.metadata.labels.file = filePath.replace(homedir(), "~");
          }
          source.set(contextName, [cluster, entity]);

          logger.debug(`Added new cluster from sync`, { filePath, contextName });
        } catch (error) {
          logger.warn(`Failed to create cluster from model: ${error}`, { filePath, contextName });
        }
      }
    } catch (error) {
      console.log(error);
      logger.warn(`Failed to compute diff: ${error}`, { filePath });
      source.clear(); // clear source if we have failed so as to not show outdated information
    }
  }
);

const computeDiffInjectable = getInjectable({
  instantiate: (di) => computeDiff({
    clearAsDeleting: di.inject(clearAsDeletingInjectable),
    configToModels: di.inject(configToModelsInjectable),
    createCluster: di.inject(createClusterInjectable),
    directoryForKubeConfigs: di.inject(directoryForKubeConfigsInjectable),
    getClusterById: di.inject(getClusterByIdInjectable),
    logger: di.inject(kubeconfigSyncManagerLoggerInjectable),
  }),
  id: "compute-diff",
});

export default computeDiffInjectable;

