/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { GeneralEntity } from "../../../../common/catalog/entity/declarations/general";
import { catalogURL } from "../../../../common/routes";

export const catalogEntity = new GeneralEntity({
  metadata: {
    uid: "catalog-entity",
    name: "Catalog",
    source: "app",
    labels: {},
  },
  spec: {
    path: catalogURL(),
    icon: {
      material: "view_list",
      background: "#3d90ce",
    },
  },
  status: {
    phase: "active",
  },
});
