/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../utils/storage/create.injectable";
import type { ItemListLayoutStorageState } from "./list-layout";

let storage: StorageLayer<ItemListLayoutStorageState>;

const itemListLayoutStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("item_list_layout", {
      showFilters: false,
    });
  },
  instantiate: () => storage,
  id: "item-list-layout-storage",
});

export default itemListLayoutStorageInjectable;
