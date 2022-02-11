/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { makeObservable } from "mobx";
import { BaseCatalogCategoryRegistry } from "../../../common/catalog/category/registry.token";

export class CatalogCategoryRegistry extends BaseCatalogCategoryRegistry {
  constructor() {
    super();
    makeObservable(this);
  }
}
