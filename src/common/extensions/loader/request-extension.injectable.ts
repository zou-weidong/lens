/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import type { LensExtensionConstructor } from "../../../extensions/lens-extension";
import type { LensLogger } from "../../logger";
import { LensProcess, lensProcessInjectionToken } from "../../vars/process.token";
import type { InstalledExtension } from "../installed.injectable";
import extensionsLoaderLoggerInjectable from "./logger.injectable";

export type RequireExtension = (extension: InstalledExtension) => LensExtensionConstructor | null;

interface Dependencies {
  lensProcess: LensProcess;
  logger: LensLogger;
}

const requireExtension = ({
  lensProcess,
  logger,
}: Dependencies): RequireExtension => (
  (extension) => {
    try {
      const extRelativePath = extension.manifest[lensProcess];

      if (extRelativePath) {
        const extAbsolutePath = path.resolve(path.join(path.dirname(extension.manifestPath), extRelativePath));

        return __non_webpack_require__(extAbsolutePath).default;
      }
    } catch (error) {
      logger.error(`cannot load ${lensProcess} for "${extension.manifest.name}": ${error.stack || error}`, extension);
    }

    return null;
  }
);

const requireExtensionInjectable = getInjectable({
  instantiate: (di) => requireExtension({
    lensProcess: di.inject(lensProcessInjectionToken),
    logger: di.inject(extensionsLoaderLoggerInjectable),
  }),
  id: "require-extension",
});

export default requireExtensionInjectable;
