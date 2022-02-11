/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, observable, makeObservable, action } from "mobx";
import type { CatalogEntity, CatalogEntityData, CatalogEntityKindData } from "../../../common/catalog/entity";
import type { CatalogCategory } from "../../../common/catalog/category";
import type { Disposer } from "../../utils";
import { iter } from "../../utils";
import { once } from "lodash";
import type { LensLogger } from "../../../common/logger";
import { CatalogRunEvent } from "./catalog-run-event";
import type { EntityChangeEvents } from "../../../common/catalog/entity/sync-types";
import type { Navigate } from "../../navigation/navigate.injectable";
import { merge } from "lodash/fp";
import type { BaseCatalogEntityRegistry } from "../../../common/catalog/entity/registry";

export type EntityFilter = (entity: CatalogEntity) => any;
export type CatalogEntityOnBeforeRun = (event: CatalogRunEvent) => void | Promise<void>;

export interface CatalogEntityRegistryDependencies {
  getEntityForData: (rawData: any) => CatalogEntity | undefined;
  navigate: Navigate;
  readonly logger: LensLogger;
}

export class CatalogEntityRegistry implements BaseCatalogEntityRegistry {
  @observable protected activeEntityId: string | undefined = undefined;
  protected _entities = observable.map<string, CatalogEntity>([], { deep: true });
  protected filters = observable.set<EntityFilter>([], {
    deep: false,
  });
  protected onBeforeRunHooks = observable.set<CatalogEntityOnBeforeRun>([], {
    deep: false,
  });

  /**
   * Buffer for keeping entities that don't yet have CatalogCategory synced
   */
  protected rawEntities = new Map<string, CatalogEntityData & CatalogEntityKindData>();

  constructor(protected readonly dependencies: CatalogEntityRegistryDependencies) {
    makeObservable(this);
  }

  protected getActiveEntityById() {
    return this._entities.get(this.activeEntityId) || null;
  }

  readonly activeEntity = computed(() => {
    const entity = this.getActiveEntityById();

    // If the entity was not found but there are rawEntities to be processed,
    // try to process them and return the entity.
    // This might happen if an extension registered a new Catalog category.
    if (this.activeEntityId && !entity && this.rawEntities.size > 0) {
      this.processRawEntities();

      return this.getActiveEntityById();
    }

    return entity;
  });

  /**
   * If `raw` is a string assume it is a valid ID, if it an entity, is that ID.
   *
   * If `raw` is `null` then clear the active entity
   */
  setActiveEntity(raw: CatalogEntity | string | null) {
    if (raw) {
      const id = typeof raw === "string"
        ? raw
        : raw.getId();

      this.activeEntityId = id;
    } else {
      this.activeEntityId = undefined;
    }
  }

  startSync(syncManager: (eventHandlers: EntityChangeEvents) => void) {
    syncManager({
      add: (data) => this.addItem(data),
      delete: action((uid) => {
        this._entities.delete(uid);
        this.rawEntities.delete(uid);
      }),
      update: action((uid, data) => {
        const prev = this._entities.get(uid) ?? this.rawEntities.get(uid);

        if (prev) {
          merge(prev, data);
        }
      }),
    });
  }

  protected addItem(item: CatalogEntityData & CatalogEntityKindData) {
    const entity = this.dependencies.getEntityForData(item);

    if (entity) {
      this._entities.set(entity.getId(), entity);
    } else {
      this.rawEntities.set(item.metadata.uid, item);
    }
  }

  protected processRawEntities() {
    const items = new Map(this.rawEntities);

    this.rawEntities.clear();

    for (const item of items.values()) {
      this.addItem(item);
    }
  }

  readonly entities = computed(() => {
    this.processRawEntities();

    return Array.from(this._entities.values());
  });

  readonly filteredEntities = computed(() => [
    ...iter.reduce(
      this.filters,
      iter.filter,
      this.entities.get().values(),
    ),
  ]);

  readonly entityMap = computed(() => (
    new Map(
      this.entities.get().map(entity => [entity.getId(), entity]),
    )
  ));

  filterEntitiesByCategory(category: CatalogCategory, { filtered = false } = {}): CatalogEntity[] {
    const supportedVersions = new Set(category.spec.versions.map((v) => `${category.spec.group}/${v.name}`));
    const entities = filtered ? this.filteredEntities : this.entities;

    return entities.get().filter(entity => supportedVersions.has(entity.apiVersion) && entity.kind === category.spec.names.kind);
  }

  /**
   * Add a new filter to the set of item filters
   * @param fn The function that should return a truthy value if that entity should be sent currently "active"
   * @returns A function to remove that filter
   */
  addFilter(fn: EntityFilter): Disposer {
    this.filters.add(fn);

    return once(() => void this.filters.delete(fn));
  }

  /**
   * Add a onBeforeRun hook. If `onBeforeRun` was previously added then it will not be added again
   * @param onBeforeRun The function that should return a boolean if the onRun of catalog entity should be triggered.
   * @returns A function to remove that hook
   */
  addOnBeforeRun(onBeforeRun: CatalogEntityOnBeforeRun): Disposer {
    this.onBeforeRunHooks.add(onBeforeRun);

    return once(() => void this.onBeforeRunHooks.delete(onBeforeRun));
  }

  /**
   * Runs all the registered `onBeforeRun` hooks, short circuiting on the first event that's preventDefaulted
   * @param entity The entity to run the hooks on
   * @returns Whether the entities `onRun` method should be executed
   */
  private async onBeforeRun(entity: CatalogEntity): Promise<boolean> {
    this.dependencies.logger.debug(`onBeforeRun for ${entity.getId()}`);

    const runEvent = new CatalogRunEvent({ target: entity });

    for (const onBeforeRun of this.onBeforeRunHooks) {
      try {
        await onBeforeRun(runEvent);
      } catch (error) {
        this.dependencies.logger.warn(`entity ${entity.getId()} onBeforeRun threw an error`, error);
      }

      if (runEvent.defaultPrevented) {
        return false;
      }
    }

    return true;
  }

  /**
   * Perform the onBeforeRun check and, if successful, then proceed to call `entity`'s onRun method
   * @param entity The instance to invoke the hooks and then execute the onRun
   */
  onRun(entity: CatalogEntity): void {
    (async () => {
      const executeRun = await this.onBeforeRun(entity);

      if (executeRun) {
        try {
          await entity.onRun?.({
            navigate: this.dependencies.navigate,
            setCommandPaletteContext: (entity) => this.setActiveEntity(entity),
          });
        } catch (error) {
          this.dependencies.logger.error(`entity ${entity.getId()} onRun threw an error`, error);
        }
      } else {
        this.dependencies.logger.debug(`onBeforeRun for ${entity.getId()} returned false`);
      }
    })();
  }
}
