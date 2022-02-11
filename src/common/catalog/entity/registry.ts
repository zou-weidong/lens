/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IComputedValue } from "mobx";
import type { CatalogEntity } from "../entity";

export interface BaseCatalogEntityRegistry {
  readonly entities: IComputedValue<CatalogEntity[]>;
}
