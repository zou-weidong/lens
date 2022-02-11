/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LoadInstances } from "../../../common/extensions/loader/load-instances.injectable";
import loadInstancesInjectable from "../../../common/extensions/loader/load-instances.injectable";
import extensionsLoaderLoggerInjectable from "../../../common/extensions/loader/logger.injectable";
import type { LensLogger } from "../../../common/logger";
import type { LensRendererExtension } from "../../../extensions/lens-renderer-extension";
import { CatalogEntityDetailRegistry, EntitySettingRegistry, GlobalPageRegistry } from "../../../extensions/registries";
import { disposer } from "../../utils";

export type LoadExtensions = () => void;

interface Dependencies {
  logger: LensLogger;
  loadInstances: LoadInstances;
}

const loadExtensions = ({
  logger,
  loadInstances,
}: Dependencies): LoadExtensions => (
  () => {
    logger.debug(`starting to load instances in cluster-frame`);

    loadInstances(async (extension: LensRendererExtension) => {
      return disposer(
        GlobalPageRegistry.getInstance().add(extension.globalPages, extension),
        EntitySettingRegistry.getInstance().add(extension.entitySettings),
        CatalogEntityDetailRegistry.getInstance().add(extension.catalogEntityDetailItems),
      );
    });
  }
);

const loadExtensionsInjectable = getInjectable({
  instantiate: (di) => loadExtensions({
    logger: di.inject(extensionsLoaderLoggerInjectable),
    loadInstances: di.inject(loadInstancesInjectable),
  }),
  id: "load-extensions",
});

export default loadExtensionsInjectable;
