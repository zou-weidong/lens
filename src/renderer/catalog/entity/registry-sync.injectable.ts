/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import catalogEntitySyncerInjectable from "./entity-syncer.injectable";
import catalogEntityRegistryInjectable from "./registry.injectable";

const catalogEntityRegistrySyncInjectable = getInjectable({
  setup: async (di) => {
    const registry = await di.inject(catalogEntityRegistryInjectable);
    const catalogEntitySyncer = await di.inject(catalogEntitySyncerInjectable);

    registry.startSync(catalogEntitySyncer);
  },
  instantiate: () => undefined,
  id: "catalog-entity-registry-sync",
});

export default catalogEntityRegistrySyncInjectable;
