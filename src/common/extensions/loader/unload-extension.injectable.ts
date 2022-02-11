/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { when } from "mobx";
import type { LensLogger } from "../../logger";
import { noop } from "../../utils";
import type { InstalledExtension } from "../installed.injectable";
import type { ExtensionInstances } from "../instances.injectable";
import extensionInstancesInjectable from "../instances.injectable";
import type { NonInstanceExtensionNames } from "../non-instance-extension-names.injectable";
import nonInstanceExtensionNamesInjectable from "../non-instance-extension-names.injectable";
import extensionsLoaderLoggerInjectable from "./logger.injectable";

export type UnloadExtension = (extension: InstalledExtension) => void;

interface Dependencies {
  nonInstanceExtensionNames: NonInstanceExtensionNames;
  extensionInstances: ExtensionInstances;
  logger: LensLogger;
}

const unloadExtension = ({
  extensionInstances,
  logger,
  nonInstanceExtensionNames,
}: Dependencies): UnloadExtension => (
  (extension) => {
    when(
      // wait for the installation to happen
      () => nonInstanceExtensionNames.has(extension.manifest.name) || extensionInstances.has(extension.id),
      () => {
        logger.info(`unloading extension ${extension.manifest.name}`);

        if (nonInstanceExtensionNames.delete(extension.manifest.name)) {
          // delete returns `true` if there WAS an entry to remove
          return;
        }

        const instance = extensionInstances.get(extension.id);

        extensionInstances.delete(extension.id);
        instance?.disable().catch(noop);
      },
    );
  }
);

const unloadExtensionInjectable = getInjectable({
  instantiate: (di) => unloadExtension({
    extensionInstances: di.inject(extensionInstancesInjectable),
    nonInstanceExtensionNames: di.inject(nonInstanceExtensionNamesInjectable),
    logger: di.inject(extensionsLoaderLoggerInjectable),
  }),
  id: "unload-extension",
});

export default unloadExtensionInjectable;
