/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Disposers, LensExtension } from "./lens-extension";
import type { CatalogEntity } from "../common/catalog/entity";
import type { IObservableArray } from "mobx";
import { computed } from "mobx";
import type { MenuRegistration } from "../main/menu/menu-registration";
import type { TrayMenuRegistration } from "../main/tray/tray-menu-registration";
import type { ShellEnvModifier } from "../main/shell-session/shell-env-modifier/types";
import type { LensMainExtensionDependencies } from "./lens-extension-set-dependencies";
import { extensionDependencies } from "./lens-extension-set-dependencies";
import type { Disposer } from "../common/utils";
import type { EntitySource } from "../main/catalog/entity/registry";

export class LensMainExtension extends LensExtension<LensMainExtensionDependencies> {
  appMenus: MenuRegistration[] = [];
  trayMenus: TrayMenuRegistration[] = [];

  /**
   * implement this to modify the shell environment that Lens terminals are opened with. The ShellEnvModifier type has the signature
   *
   * (ctx: ShellEnvContext, env: Record<string, string | undefined>) => Record<string, string | undefined>
   *
   *  @param ctx the shell environment context, specifically the relevant catalog entity for the terminal. This can be used, for example, to get
   * cluster-specific information that can be made available in the shell environment by the implementation of terminalShellEnvModifier
   *
   * @param env the current shell environment that the terminal will be opened with. The implementation should modify this as desired.
   *
   * @returns the modified shell environment that the terminal will be opened with. The implementation must return env as passed in, if it
   * does not modify the shell environment
   */
  terminalShellEnvModifier?: ShellEnvModifier;

  navigate(pageId?: string, params?: Record<string, any>): void;
  /**
   * @deprecated this function isn't really async, it just returns a resolved promise
   */
  navigate(pageId?: string, params?: Record<string, any>, frameId?: number): Promise<void>;
  navigate(pageId?: string, params?: Record<string, any>): Promise<void> {
    this[extensionDependencies].navigateExtension(this.id, pageId, params);

    return Promise.resolve();
  }

  /**
   * Add a computed catalog entity source. This is the mechanism for adding
   * entities to the catalog
   *
   * NOTE: This source will be removed when the extension is disabled or uninstalled.
   */
  addComputedCatalogSource(source: EntitySource): void {
    this[Disposers].push(this[extensionDependencies].addComputedSource(source));
  }

  private removers = new Map<string, Disposer>();

  /**
   * @deprecated use {@link LensMainExtension.addComputedCatalogSource} instead so you don't need to track the lifecycle of catalog sources
   */
  addCatalogSource(id: string, source: IObservableArray<CatalogEntity>): void {
    if (this.removers.has(id)) {
      throw new Error(`${id} already exists as a catalog source`);
    }

    this.removers.set(id, this[extensionDependencies].addComputedSource(computed(() => [...source])));
  }

  /**
   * @deprecated use {@link LensMainExtension.addComputedCatalogSource} instead so you don't need to track the lifecycle of catalog sources
   */
  removeCatalogSource(id: string): void {
    const removeSource = this.removers.get(id);

    if (!removeSource) {
      throw new Error(`${id} as a source has already been removed`);
    }

    this.removers.delete(id);
    removeSource();
  }
}
