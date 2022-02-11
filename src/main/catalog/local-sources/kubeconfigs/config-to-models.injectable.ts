/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeConfig } from "@kubernetes/client-node";
import { getInjectable } from "@ogre-tools/injectable";
import type { UpdateClusterModel } from "../../../../common/clusters/cluster-types";
import { splitConfig } from "../../../../common/k8s/helpers";
import type { LensLogger } from "../../../../common/logger";
import kubeconfigSyncManagerLoggerInjectable from "./logger.injectable";

export type ConfigToModels = (rootConfig: KubeConfig, filePath: string) => UpdateClusterModel[];

interface Dependencies {
  logger: LensLogger;
}

const configToModels = ({ logger }: Dependencies): ConfigToModels => (
  (rootConfig, filePath) => {
    const validConfigs = [];

    for (const { config, error } of splitConfig(rootConfig)) {
      if (error) {
        logger.debug(`context failed validation: ${error}`, { context: config.currentContext, filePath });
      } else {
        validConfigs.push({
          kubeConfigPath: filePath,
          contextName: config.currentContext,
        });
      }
    }

    return validConfigs;
  }
);

const configToModelsInjectable = getInjectable({
  instantiate: (di) => configToModels({
    logger: di.inject(kubeconfigSyncManagerLoggerInjectable),
  }),
  id: "config-to-models",
});

export default configToModelsInjectable;
