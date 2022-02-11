/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ObservableMap } from "mobx";
import { observable } from "mobx";
import type { LensExtensionId, LensExtensionManifest } from "./manifest";

export interface BaseInstalledExtension<Manifest> {
  readonly id: LensExtensionId;

  readonly manifest: Manifest;

  // Absolute path to the non-symlinked source folder,
  // e.g. "/Users/user/.k8slens/extensions/helloworld"
  readonly absolutePath: string;

  // Absolute to the symlinked package.json file
  readonly manifestPath: string;
  readonly isBundled: boolean; // defined in project root's package.json
  readonly isCompatible: boolean;
}

export type InstalledExtension = BaseInstalledExtension<LensExtensionManifest>;

export type InstalledExtensions = ObservableMap<LensExtensionId, InstalledExtension>;

const installedExtensionsInjectable = getInjectable({
  instantiate: (): InstalledExtensions => observable.map(),
  id: "installed-extensions",
});

export default installedExtensionsInjectable;
