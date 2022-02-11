/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Disposer } from "../../utils";
import type { EntityFilter } from "./registry";
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntityRegistryInjectable from "./registry.injectable";

export type AddEntityFilter = (fn: EntityFilter) => Disposer;


const addEntityFilterInjectable = getInjectable({
  instantiate: (di): AddEntityFilter => {
    const registry = di.inject(catalogEntityRegistryInjectable);

    return (fn) => registry.addFilter(fn);
  },
  id: "add-entity-filter",
});

export default addEntityFilterInjectable;

