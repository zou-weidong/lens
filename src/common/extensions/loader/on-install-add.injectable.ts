/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { ObservableMap, reaction } from "mobx";
import type { LensLogger } from "../../logger";
import type { Disposer } from "../../utils";
import type { InstalledExtension } from "../installed.injectable";
import type { LensExtensionId } from "../manifest";
import type { IsExtensionEnabled } from "../preferences/is-enabled.injectable";
import isExtensionEnabledInjectable from "../preferences/is-enabled.injectable";
import installationReactionsInjectable from "./installation-reactions.injectable";
import type { LoadExtension } from "./load-instance.injectable";
import loadInstanceInjectable from "./load-instance.injectable";
import type { RegisterExtension } from "./load-instances.injectable";
import extensionsLoaderLoggerInjectable from "./logger.injectable";
import type { UnloadExtension } from "./unload-extension.injectable";
import unloadExtensionInjectable from "./unload-extension.injectable";

export type OnInstalledExtensionsAdd = (extension: InstalledExtension, register: RegisterExtension) => void;

interface Dependencies {
  isExtensionEnabled: IsExtensionEnabled;
  loadExtension: LoadExtension;
  unloadExtension: UnloadExtension;
  installationReactions: ObservableMap<LensExtensionId, Disposer>;
  logger: LensLogger;
}

const onInstalledExtensionsAdd = ({
  loadExtension,
  unloadExtension,
  isExtensionEnabled,
  installationReactions,
  logger,
}: Dependencies): OnInstalledExtensionsAdd => (
  (extension, register) => {
    installationReactions.set(
      extension.id,
      reaction(
        () => isExtensionEnabled(extension),
        (isEnabled) => {
          if (isEnabled) {
            logger.info(`Instance for ${extension.manifest.name} will now be loaded`);
            loadExtension(extension, register);
          } else {
            logger.info(`Instance for ${extension.manifest.name} will now be unloaded`);
            unloadExtension(extension);
          }
        },
        {
          fireImmediately: true,
        },
      ),
    );
  }
);

const onInstalledExtensionsAddInjectable = getInjectable({
  instantiate: (di) => onInstalledExtensionsAdd({
    loadExtension: di.inject(loadInstanceInjectable),
    isExtensionEnabled: di.inject(isExtensionEnabledInjectable),
    unloadExtension: di.inject(unloadExtensionInjectable),
    installationReactions: di.inject(installationReactionsInjectable),
    logger: di.inject(extensionsLoaderLoggerInjectable),
  }),
  id: "on-installed-extensions-add",
});

export default onInstalledExtensionsAddInjectable;
