/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { emitExtensionLoadedInjectionToken, ExtensionLoaded } from "../../ipc/extensions/loaded.token";
import type { LensLogger } from "../../logger";
import type { InstalledExtension } from "../installed.injectable";
import extensionInstancesInjectable, { ExtensionInstances } from "../instances.injectable";
import nonInstanceExtensionNamesInjectable, { NonInstanceExtensionNames } from "../non-instance-extension-names.injectable";
import type { CreateExtensionInstance } from "./create-extension-instance.injectable";
import createExtensionInstanceInjectable from "./create-extension-instance.injectable";
import type { RegisterExtension } from "./load-instances.injectable";
import extensionsLoaderLoggerInjectable from "./logger.injectable";
import type { RequireExtension } from "./request-extension.injectable";
import requireExtensionInjectable from "./request-extension.injectable";

export type LoadExtension = (extension: InstalledExtension, register: RegisterExtension) => void;

interface Dependencies {
  extensionLoaded: ExtensionLoaded;
  nonInstanceExtensionNames: NonInstanceExtensionNames;
  extensionInstances: ExtensionInstances;
  logger: LensLogger;
  requireExtension: RequireExtension;
  createExtensionInstance: CreateExtensionInstance;
}

const loadInstance = ({
  extensionLoaded,
  nonInstanceExtensionNames,
  extensionInstances,
  logger,
  requireExtension,
  createExtensionInstance,
}: Dependencies): LoadExtension => (
  (extension, register) => {
    if (!extension.isCompatible) {
      return void nonInstanceExtensionNames.add(extension.manifest.name);
    }

    const LensExtensionClass = requireExtension(extension);

    if (!LensExtensionClass) {
      return void nonInstanceExtensionNames.add(extension.manifest.name);
    }

    const instance = createExtensionInstance(
      LensExtensionClass,
      extension,
    );

    extensionInstances.set(extension.id, instance);

    (async (): Promise<void> => {
      try {
        await instance.activate();
      } catch (error) {
        return logger.error("error activating extension", { ext: extension, error });
      }

      try {
        await instance.enable(register);

        // Only mark as loaded once everything works
        extensionLoaded(extension.id);
      } catch (error) {
        return logger.error("error enabling extension", { ext: extension, error });
      }
    })();
  }
);

const loadInstanceInjectable = getInjectable({
  instantiate: (di) => loadInstance({
    extensionLoaded: di.inject(emitExtensionLoadedInjectionToken),
    extensionInstances: di.inject(extensionInstancesInjectable),
    nonInstanceExtensionNames: di.inject(nonInstanceExtensionNamesInjectable),
    logger: di.inject(extensionsLoaderLoggerInjectable),
    createExtensionInstance: di.inject(createExtensionInstanceInjectable),
    requireExtension: di.inject(requireExtensionInjectable),
  }),
  id: "load-instance",
});

export default loadInstanceInjectable;
