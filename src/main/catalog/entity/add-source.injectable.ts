/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "../../../common/utils";
import type { EntitySource } from "./registry";
import catalogEntityRegistryInjectable from "./registry.injectable";

export type AddCatalogSource = (src: EntitySource) => Disposer;

const addCatalogSourceInjectable = getInjectable({
  instantiate: (di): AddCatalogSource => {
    const registry = di.inject(catalogEntityRegistryInjectable);

    return (src) => registry.addSource(src);
  },
  id: "add-catalog-source",
});

export default addCatalogSourceInjectable;
