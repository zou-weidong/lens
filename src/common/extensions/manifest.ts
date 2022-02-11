/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { SemVer } from "semver";
import type { PackageJson } from "type-fest";

export type LensExtensionId = string; // path to manifest (package.json)

export interface LensExtensionManifest {
  /**
   * Name of the extension, must be globally unique
   */
  name: string;

  publisher?: string;
  license?: string;
  author?: PackageJson.Person;
  description: string;

  /**
  The dependencies of the package.
  */
  dependencies?: PackageJson.Dependency;

  /**
  Additional tooling dependencies that are not required for the package to work. Usually test, build, or documentation tooling.
  */
  devDependencies?: PackageJson.Dependency;

  /**
   * The parsed version of the extension
   */
  version: SemVer;

  /**
   * Path to the main side entry point
   */
  main?: string;

  /**
   * Path to the renderer side entry point
   */
  renderer?: string;

  engines: {
    /**
     * supported version range for this extension
     */
    lens: string;
  };
}

export interface RawLensExtensionManifest extends PackageJson {
  description: string;
  name: string;
  version: string;
  main?: string; // path to %ext/dist/main.js
  renderer?: string; // path to %ext/dist/renderer.js
  engines: {
    /**
     * supported version range for this extension
     */
    lens: string;
    [other: string]: string | undefined;
  };
}

export function convertToRawManifest(manifest: LensExtensionManifest): RawLensExtensionManifest {
  const { version: parsedVersion, ...manifestData } = manifest;
  const version = parsedVersion.format();

  return {
    version,
    ...manifestData,
  };
}

export function convertFromRawManifest(manifest: RawLensExtensionManifest): LensExtensionManifest {
  const { version: rawVersion, ...manifestData } = manifest;
  const version = new SemVer(rawVersion);

  return {
    version,
    ...manifestData,
  };
}
