/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { GeneralEntity } from "../../entity/declarations";
import { CatalogCategory } from "../../category";

export class GeneralCategory extends CatalogCategory {
  public readonly apiVersion = "catalog.k8slens.dev/v1alpha1";
  public readonly kind = "CatalogCategory";
  public metadata = {
    name: "General",
    icon: "settings",
  };
  public spec = {
    group: "entity.k8slens.dev",
    versions: [
      {
        name: "v1alpha1",
        entityClass: GeneralEntity,
      },
    ],
    names: {
      kind: "General",
    },
  };
}
