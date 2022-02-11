/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IComputedValue } from "mobx";
import { when } from "mobx";
import type { KubernetesCluster } from "../../../common/catalog/entity/declarations";
import type { CatalogEntity } from "../../../common/catalog/entity";
import type { LoadInstances } from "../../../common/extensions/loader/load-instances.injectable";
import loadInstancesInjectable from "../../../common/extensions/loader/load-instances.injectable";
import extensionsLoaderLoggerInjectable from "../../../common/extensions/loader/logger.injectable";
import type { LensLogger } from "../../../common/logger";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import { ClusterPageMenuRegistry, ClusterPageRegistry, KubeObjectDetailRegistry } from "../../../extensions/registries";
import activeEntityInjectable from "../../catalog/entity/active-entity.injectable";
import { disposer, noop } from "../../utils";

export type LoadExtensions = () => void;

interface Dependencies {
  logger: LensLogger;
  loadInstances: LoadInstances;
  activeEntity: IComputedValue<CatalogEntity | undefined>;
}

const loadExtensions = ({
  logger,
  loadInstances,
  activeEntity,
}: Dependencies): LoadExtensions => (
  () => {
    logger.debug(`starting to load instances in root-frame`);

    loadInstances(async (extension: LensRendererExtension) => {
      /**
       * isEnabledForCluster is now an optional method so the extension only cares about it if it
       * is provided.
       *
       * If the extension doesn't care, then we can just go ahead and register them anyway.
       *
       * NOTE: once DI is finished we will need to move this check to the other dependencies
       */
      if (extension.isEnabledForCluster) {
        await when(() => Boolean(activeEntity.get()));

        if (!extension.isEnabledForCluster(activeEntity.get() as KubernetesCluster)) {
          return noop;
        }
      }

      return disposer(
        ClusterPageRegistry.getInstance().add(extension.clusterPages, extension),
        ClusterPageMenuRegistry.getInstance().add(extension.clusterPageMenus, extension),
        KubeObjectDetailRegistry.getInstance().add(extension.kubeObjectDetailItems),
      );
    });
  }
);

const loadExtensionsInjectable = getInjectable({
  instantiate: (di) => loadExtensions({
    logger: di.inject(extensionsLoaderLoggerInjectable),
    loadInstances: di.inject(loadInstancesInjectable),
    activeEntity: di.inject(activeEntityInjectable),
  }),
  id: "load-extensions",
});

export default loadExtensionsInjectable;
