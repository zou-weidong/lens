/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { observable, makeObservable } from "mobx";

export interface NavigateActionOptions {
  /**
   * If `true` then the navigate will only navigate on the root frame and not
   * within a cluster
   * @default false
   */
  forceRootFrame?: boolean;
}

/**
 * Naivate to a specific url
 * @param url the URL to navigate to
 * @param opts The options for this navigate call
 */
export type NavigateAction = (url: string, opts?: NavigateActionOptions) => void;

export interface ContextActionNavigate {
  /**
   * Naivate to a specific url
   */
  navigate: NavigateAction;
}

export interface CatalogEntityMetadata {
  uid: string;
  name: string;
  shortName?: string;
  description?: string;
  source?: string;
  labels: Record<string, string>;
  [key: string]: string | Record<string, string>;
}

export interface CatalogEntityStatus {
  phase: string;
  reason?: string;

  /**
   * @default true
   */
  enabled?: boolean;
  message?: string;
  active?: boolean;
  [key: string]: string | number | boolean;
}

export interface CatalogEntityActionContext extends ContextActionNavigate {
  setCommandPaletteContext: (context?: CatalogEntity) => void;
}

export interface CatalogEntityContextMenuConfirm {
  message: string;
}

export interface CatalogEntityContextMenu {
  /**
   * Menu title
   */
  title: string;
  /**
   * Menu icon
   */
  icon?: string;
  /**
   * OnClick handler
   */
  onClick: () => void;
  /**
   * Confirm click with a message
   */
  confirm?: CatalogEntityContextMenuConfirm;
}

export interface CatalogEntityAddMenu extends CatalogEntityContextMenu {
  icon: string;
  defaultAction?: boolean;
}

export interface CatalogEntitySettingsMenu {
  group?: string;
  title: string;
  components: {
    View: React.ComponentType<{}>;
  };
}

export interface CatalogEntityContextMenuContext extends ContextActionNavigate {
  menuItems: CatalogEntityContextMenu[];
}

export interface CatalogEntitySettingsContext {
  menuItems: CatalogEntityContextMenu[];
}

export interface CatalogEntityAddMenuContext {
  navigate: (url: string) => void;
  menuItems: CatalogEntityAddMenu[];
}

export type CatalogEntitySpec = Record<string, any>;


export interface CatalogEntityData<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> {
  metadata: Metadata;
  status: Status;
  spec: Spec;
}

export interface CatalogEntityKindData {
  readonly apiVersion: string;
  readonly kind: string;
}

export abstract class CatalogEntity<
  Metadata extends CatalogEntityMetadata = CatalogEntityMetadata,
  Status extends CatalogEntityStatus = CatalogEntityStatus,
  Spec extends CatalogEntitySpec = CatalogEntitySpec,
> implements CatalogEntityKindData {
  /**
   * The group and version of this class.
   */
  public abstract readonly apiVersion: string;

  /**
   * A DNS label name of the entity.
   */
  public abstract readonly kind: string;

  @observable metadata: Metadata;
  @observable status: Status;
  @observable spec: Spec;

  constructor({ metadata, status, spec }: CatalogEntityData<Metadata, Status, Spec>) {
    makeObservable(this);

    if (!metadata || typeof metadata !== "object") {
      throw new TypeError("CatalogEntity's metadata must be a defined object");
    }

    if (!status || typeof status !== "object") {
      throw new TypeError("CatalogEntity's status must be a defined object");
    }

    if (!spec || typeof spec !== "object") {
      throw new TypeError("CatalogEntity's spec must be a defined object");
    }

    this.metadata = metadata;
    this.status = status;
    this.spec = spec;
  }

  /**
   * Get the UID of this entity
   */
  public getId(): string {
    return this.metadata.uid;
  }

  /**
   * Get the name of this entity
   */
  public getName(): string {
    return this.metadata.name;
  }

  /**
   * Get the specified source of this entity, defaulting to `"unknown"` if not
   * provided
   */
  public getSource(): string {
    return this.metadata.source ?? "unknown";
  }

  /**
   * Get if this entity is enabled.
   */
  public isEnabled(): boolean {
    return this.status.enabled ?? true;
  }

  /**
   * This method is the main action of an entity.
   */
  public abstract onRun?(context: CatalogEntityActionContext): void | Promise<void>;

  /**
   * This method will be called when context menu of this specific entity is opened
   */
  public onContextMenuOpen?(context: CatalogEntityContextMenuContext): void;
  /**
   * @deprecated Asyncronous event handlers are not specially supported
   */
  public onContextMenuOpen?(context: CatalogEntityContextMenuContext): void | Promise<void>;

  /**
   * This method will be called when the settings page for a specific entity is opened
   */
  public onSettingsOpen?(context: CatalogEntitySettingsContext): void;
  /**
   * @deprecated Asyncronous event handlers are not specially supported
   */
  public onSettingsOpen?(context: CatalogEntitySettingsContext): void | Promise<void>;
}
