/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogEntityConstructor } from "../category";
import catalogEntitiesInjectable from "./entities.injectable";
import type { CatalogEntity } from "../entity";

export type FindEntitiesByClass = (classCtor: CatalogEntityConstructor<CatalogEntity>) => CatalogEntity[];

const findEntitiesByClassInjectable = getInjectable({
  instantiate: (di): FindEntitiesByClass => {
    const entities = di.inject(catalogEntitiesInjectable);

    return (ctor) => entities.get().filter(item => item instanceof ctor);
  },
  id: "find-entities-by-class",
});

export default findEntitiesByClassInjectable;
