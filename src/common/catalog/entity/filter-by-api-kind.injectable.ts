/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntitiesInjectable from "./entities.injectable";
import type { CatalogEntity } from "../entity";

export type FilterEntitiesByApiKind = (apiVersion: string, kind: string) => CatalogEntity[];

const filterEntitiesByApiKindInjectable = getInjectable({
  id: "filter-entities-by-api-kind",
  instantiate: (di): FilterEntitiesByApiKind => {
    const entities = di.inject(catalogEntitiesInjectable);

    return (apiVersion, kind) => entities.get().filter((item) => item.apiVersion === apiVersion && item.kind === kind);
  },
});

export default filterEntitiesByApiKindInjectable;

