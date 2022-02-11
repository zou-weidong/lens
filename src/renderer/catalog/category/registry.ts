/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { computed, observable, makeObservable } from "mobx";
import type { Disposer } from "../../../common/utils";
import { iter } from "../../../common/utils";
import { once } from "lodash";
import type { CatalogCategory } from "../../../common/catalog/category";
import { BaseCatalogCategoryRegistry } from "../../../common/catalog/category/registry.token";

export type CategoryFilter = (category: CatalogCategory) => any;

export class CatalogCategoryRegistry extends BaseCatalogCategoryRegistry {
  protected filters = observable.set<CategoryFilter>([], {
    deep: false,
  });

  constructor() {
    super();
    makeObservable(this);
  }

  readonly filteredCategories = computed(() => [
    ...iter.reduce(
      this.filters,
      iter.filter,
      this.categories.get().values(),
    ),
  ]);

  /**
   * Add a new filter to the set of category filters
   * @param fn The function that should return a truthy value if that category should be displayed
   * @returns A function to remove that filter
   */
  addFilter(fn: CategoryFilter): Disposer {
    this.filters.add(fn);

    return once(() => void this.filters.delete(fn));
  }
}
