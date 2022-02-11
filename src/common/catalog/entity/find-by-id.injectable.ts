/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntitiesInjectable from "./entities.injectable";
import type { CatalogEntity } from "../entity";

export type FindEntityById = (id: string) => CatalogEntity | undefined;

const findEntityByIdInjectable = getInjectable({
  instantiate: (di): FindEntityById => {
    const entities = di.inject(catalogEntitiesInjectable);

    return (id) => entities.get().find(entity => entity.getId() === id);
  },
  id: "find-entity-by-id",
});

export default findEntityByIdInjectable;
