/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { InstalledExtension, InstalledExtensions } from "./installed.injectable";
import type { LensExtensionId } from "./manifest";
import { getInjectable } from "@ogre-tools/injectable";
import installedExtensionsInjectable from "./installed.injectable";

export type GetInstalledExtensionById = (extId: LensExtensionId) => InstalledExtension | undefined;

interface Dependencies {
  installedExtensions: InstalledExtensions;
}

const getInstalledExtensionById = ({
  installedExtensions,
}: Dependencies): GetInstalledExtensionById => (
  (extId) => installedExtensions.get(extId)
);

const getInstalledExtensionByIdInjectable = getInjectable({
  instantiate: (di) => getInstalledExtensionById({
    installedExtensions: di.inject(installedExtensionsInjectable),
  }),
  id: "get-installed-extension-by-id",
});

export default getInstalledExtensionByIdInjectable;

