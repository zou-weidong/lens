/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { SemVer } from "semver";
import { getInjectable } from "@ogre-tools/injectable";
import appVersionInjectable from "../../../common/vars/app-version.injectable";
import isProductionInjectable from "../../../common/vars/is-production.injectable";
import type { LensExtensionManifest } from "../../../common/extensions/manifest";

export type IsCompatibleBundledExtension = (manifest: LensExtensionManifest) => boolean;

interface Dependencies {
  appVersion: SemVer;
  isProduction: boolean;
}

const isCompatibleBundledExtension = ({
  appVersion,
  isProduction,
}: Dependencies): IsCompatibleBundledExtension => (
  isProduction
    ? (manifest) => manifest.version.compare(appVersion) === 0
    : () => true
);

const isCompatibleBundledExtensionInjectable = getInjectable({
  instantiate: (di) => isCompatibleBundledExtension({
    appVersion: di.inject(appVersionInjectable),
    isProduction: di.inject(isProductionInjectable),
  }),
  id: "is-compatible-bundled-extension",
});

export default isCompatibleBundledExtensionInjectable;
