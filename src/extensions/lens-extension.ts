/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, observable, makeObservable } from "mobx";
import type { ProtocolHandlerRegistration } from "./registries";
import { disposer } from "../common/utils";
import type { LensExtensionDependencies } from "./lens-extension-set-dependencies";
import { extensionDependencies } from "./lens-extension-set-dependencies";
import type { SemVer } from "semver";
import type { InstalledExtension } from "../common/extensions/installed.injectable";
import type { LensExtensionId, LensExtensionManifest } from "../common/extensions/manifest";
import type { RegisterExtension } from "../common/extensions/loader/load-instances.injectable";

export type LensExtensionConstructor = new (...args: ConstructorParameters<typeof LensExtension>) => LensExtension;

export const Disposers = Symbol();

export class LensExtension<Dependencies extends LensExtensionDependencies = LensExtensionDependencies> {
  readonly id: LensExtensionId;
  readonly manifest: LensExtensionManifest;
  readonly manifestPath: string;
  readonly isBundled: boolean;

  protocolHandlers: ProtocolHandlerRegistration[] = [];

  @observable private _isEnabled = false;

  /**
   * This is a marker for "has been enabled", not "should be enabled"
   */
  get hasBeenEnabled() {
    return this._isEnabled;
  }

  /**
   * @deprecated use `this.hasBeenEnabled` instead
   */
  get isEnabled() {
    return this.hasBeenEnabled;
  }

  [Disposers] = disposer();

  constructor({ id, manifest, manifestPath, isBundled }: InstalledExtension) {
    makeObservable(this);
    this.id = id;
    this.manifest = manifest;
    this.manifestPath = manifestPath;
    this.isBundled = !!isBundled;
  }

  get name() {
    return this.manifest.name;
  }

  get version() {
    return this.manifest.version;
  }

  get description() {
    return this.manifest.description;
  }

  /**
   * @internal
   */
  [extensionDependencies]: Dependencies;

  /**
   * getExtensionFileFolder returns the path to an already created folder. This
   * folder is for the sole use of this extension.
   *
   * Note: there is no security done on this folder, only obfuscation of the
   * folder name.
   */
  getExtensionFileFolder(): Promise<string> {
    return this[extensionDependencies].requestDirectory(this.id);
  }

  @action
  async enable(register: RegisterExtension) {
    if (this._isEnabled) {
      return;
    }

    try {
      this._isEnabled = true;

      this[Disposers].push(await register(this));
      this[extensionDependencies].logger.info(`enabled ${this.name}@${this.version}`);
    } catch (error) {
      this[extensionDependencies].logger.error(`failed to activate ${this.name}@${this.version}: ${error}`);
    }
  }

  @action
  async disable() {
    if (!this._isEnabled) {
      return;
    }

    this._isEnabled = false;

    try {
      await this.onDeactivate();
      this[Disposers]();
      this[extensionDependencies].logger.info(`disabled ${this.name}@${this.version}`);
    } catch (error) {
      this[extensionDependencies].logger.error(`disabling ${this.name}@${this.version} threw an error: ${error}`);
    }
  }

  async activate(): Promise<void> {
    return this.onActivate();
  }

  protected onActivate(): Promise<void> | void {
    return;
  }

  protected onDeactivate(): Promise<void> | void {
    return;
  }
}

export function sanitizeExtensionName(name: string) {
  return name.replace("@", "").replace("/", "--");
}

export function extensionDisplayName(name: string, version: SemVer) {
  return `${name}@${version.format()}`;
}
