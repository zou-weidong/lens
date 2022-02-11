/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import { computed, observable } from "mobx";
import type { CatalogEntity } from "../../../common/catalog/entity";
import type { BaseCatalogEntityRegistry } from "../../../common/catalog/entity/registry";
import type { Disposer } from "../../../common/utils";
import { iter } from "../../../common/utils";
import type { CatalogCategoryRegistry } from "../category/registry";

export interface CatalogEntityRegistryDependencies {
  readonly categoryRegistry: CatalogCategoryRegistry;
}

export type EntitySource = IComputedValue<CatalogEntity[]>;

export class CatalogEntityRegistry implements BaseCatalogEntityRegistry {
  protected readonly sources = observable.set<EntitySource>();

  constructor(protected readonly dependencies: CatalogEntityRegistryDependencies) {}

  addSource(source: EntitySource): Disposer {
    this.sources.add(source);

    return () => {
      this.sources.delete(source);
    };
  }

  readonly entities = computed(() => Array.from(
    iter.filter(
      iter.flatMap(this.sources.values(), source => source.get()),
      entity => this.dependencies.categoryRegistry.getCategoryForEntity(entity),
    ),
  ));
}
