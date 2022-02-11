/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ObservableMap } from "mobx";
import type { LensLogger } from "../../logger";
import type { Disposer } from "../../utils";
import type { InstalledExtension } from "../installed.injectable";
import type { LensExtensionId } from "../manifest";
import installationReactionsInjectable from "./installation-reactions.injectable";
import extensionsLoaderLoggerInjectable from "./logger.injectable";
import type { UnloadExtension } from "./unload-extension.injectable";
import unloadExtensionInjectable from "./unload-extension.injectable";

export type OnInstalledExtensionsDelete = (extension: InstalledExtension) => void;

interface Dependencies {
  unloadExtension: UnloadExtension;
  installationReactions: ObservableMap<LensExtensionId, Disposer>;
  logger: LensLogger;
}

const onInstalledExtensionsDelete = ({
  unloadExtension,
  installationReactions,
  logger,
}: Dependencies): OnInstalledExtensionsDelete => (
  (extension) => {
    logger.info(`Deleting instance for ${extension.manifest.name}`);
    installationReactions.get(extension.id)?.();
    unloadExtension(extension);
  }
);

const onInstalledExtensionsDeleteInjectable = getInjectable({
  instantiate: (di) => onInstalledExtensionsDelete({
    unloadExtension: di.inject(unloadExtensionInjectable),
    installationReactions: di.inject(installationReactionsInjectable),
    logger: di.inject(extensionsLoaderLoggerInjectable),
  }),
  id: "on-installed-extensions-delete",
});

export default onInstalledExtensionsDeleteInjectable;
