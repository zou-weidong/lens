/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogEntity } from "../../../common/catalog/entity";
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "./registry.injectable";

export type EntityOnRun = (entity: CatalogEntity) => void;

const entityOnRunInjectable = getInjectable({
  instantiate: (di): EntityOnRun => {
    const registry = di.inject(catalogEntityRegistryInjectable);

    return (entity) => registry.onRun(entity);
  },
  id: "entity-on-run",
});

export default entityOnRunInjectable;

