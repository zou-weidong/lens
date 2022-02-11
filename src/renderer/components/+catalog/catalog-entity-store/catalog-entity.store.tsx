/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, makeObservable, observable, reaction } from "mobx";
import type { CatalogEntityRegistry } from "../../../catalog/entity/registry";
import { ItemStore } from "../../../../common/item.store";
import { autoBind, disposer } from "../../../../common/utils";
import type { CatalogCategory } from "../../../../common/catalog/category";
import type { CatalogEntity } from "../../../../common/catalog/entity";
import type { CatalogCategoryRegistry } from "../../../catalog/category/registry";

interface Dependencies {
  readonly entityRegistry: CatalogEntityRegistry;
  readonly categoryRegistry: CatalogCategoryRegistry;
}

export class CatalogEntityStore extends ItemStore<CatalogEntity> {
  constructor(private readonly dependencies: Dependencies) {
    super();
    makeObservable(this);
    autoBind(this);
  }

  @observable activeCategory?: CatalogCategory;
  @observable selectedItemId?: string;

  @computed get entities() {
    if (!this.activeCategory) {
      return this.dependencies.entityRegistry.filteredEntities.get();
    }

    return this.dependencies.entityRegistry.filterEntitiesByCategory(this.activeCategory, { filtered: true });
  }

  @computed get selectedItem() {
    return this.entities.find(e => e.getId() === this.selectedItemId);
  }

  watch() {
    return disposer(
      reaction(() => this.entities, () => this.loadAll()),
      reaction(() => this.activeCategory, () => this.loadAll(), { delay: 100 }),
    );
  }

  loadAll() {
    if (this.activeCategory) {
      this.activeCategory.emit("load");
    } else {
      for (const category of this.dependencies.categoryRegistry.categories.get()) {
        category.emit("load");
      }
    }

    // concurrency is true to fix bug if catalog filter is removed and added at the same time
    return this.loadItems(() => this.entities, undefined, true);
  }

  onRun(entity: CatalogEntity): void {
    this.dependencies.entityRegistry.onRun(entity);
  }
}
