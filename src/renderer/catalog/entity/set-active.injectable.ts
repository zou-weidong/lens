/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { CatalogEntity } from "../../../common/catalog/entity";
import type { CatalogEntityRegistry } from "./registry";
import catalogEntityRegistryInjectable from "./registry.injectable";

export type SetActiveEntity = (entity: CatalogEntity | string | null) => void;

interface Dependencies {
  registry: CatalogEntityRegistry;
}

const setActiveEntity = ({ registry }: Dependencies): SetActiveEntity => (
  (entity) => {
    registry.setActiveEntity(entity);
  }
);

const setActiveEntityInjectable = getInjectable({
  instantiate: (di) => setActiveEntity({
    registry: di.inject(catalogEntityRegistryInjectable),
  }),
  id: "set-active-entity",
});

export default setActiveEntityInjectable;
