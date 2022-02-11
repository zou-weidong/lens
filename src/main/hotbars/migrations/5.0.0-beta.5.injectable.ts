/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { HotbarItems } from "../../../common/hotbars/hotbar-types";
import type { MigrationDeclaration } from "../../utils";
import { getInjectable } from "@ogre-tools/injectable";
import type { FindEntityById } from "../../../common/catalog/entity/find-by-id.injectable";
import findEntityByIdInjectable from "../../../common/catalog/entity/find-by-id.injectable";

interface Pre500Beta5Hotbar {
  id: string;
  name: string;
  items: HotbarItems;
}

interface Dependencies {
  findEntityById: FindEntityById;
}

const v500Beta5Migration = ({ findEntityById }: Dependencies): MigrationDeclaration => ({
  version: "5.0.0-beta.5",
  run(log, store) {
    const rawHotbars = store.get("hotbars");
    const hotbars: Pre500Beta5Hotbar[] = Array.isArray(rawHotbars) ? rawHotbars : [];

    for (const hotbar of hotbars) {
      for (let i = 0; i < hotbar.items.length; i += 1) {
        const item = hotbar.items[i];
        const entity = findEntityById(item?.entity.uid);

        if (!entity) {
          // Clear disabled item
          hotbar.items[i] = null;
        } else {
          // Save additional data
          hotbar.items[i].entity = {
            ...item.entity,
            name: entity.metadata.name,
            source: entity.metadata.source,
          };
        }
      }
    }

    store.set("hotbars", hotbars);
  },
});

const v500Beta5MigrationInjectable = getInjectable({
  instantiate: (di) => v500Beta5Migration({
    findEntityById: di.inject(findEntityByIdInjectable),
  }),
  id:"hotbar-store-v5.0.0-beta.5-migration",
});

export default v500Beta5MigrationInjectable;
