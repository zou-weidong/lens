/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Cleans up a store that had the state related data stored
import { getInjectable } from "@ogre-tools/injectable";
import type { CreateHotbar } from "../../../common/hotbars/create-hotbar.injectable";
import createHotbarInjectable from "../../../common/hotbars/create-hotbar.injectable";
import { catalogEntity } from "../../catalog/local-sources/general/view-catalog-entity";
import type { MigrationDeclaration } from "../../utils";

interface Dependencies {
  createHotbar: CreateHotbar;
}

const v500Alpha0Migration = ({ createHotbar }: Dependencies): MigrationDeclaration => ({
  version: "5.0.0-alpha.0",
  run(log, store) {
    const [id, hotbar] = createHotbar({ name: "default" });
    const { metadata: { uid, name, source }} = catalogEntity;

    hotbar.items[0] = { entity: { uid, name, source }};

    store.set("hotbars", [{ id, ...hotbar }]);
  },
});

const v500Alpha0MigrationInjectable = getInjectable({
  instantiate: (di) => v500Alpha0Migration({
    createHotbar: di.inject(createHotbarInjectable),
  }),
  id: "hotbar-store-v5.0.0-alpha.0-migration",
});

export default v500Alpha0MigrationInjectable;
