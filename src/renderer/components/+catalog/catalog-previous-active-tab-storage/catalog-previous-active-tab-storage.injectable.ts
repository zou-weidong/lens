/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { browseCatalogTab } from "../../../../common/routes";
import createStorageInjectable, { type StorageLayer } from "../../../utils/storage/create.injectable";

let storage: StorageLayer<string>;

const catalogPreviousActiveTabStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("catalog-previous-active-tab", browseCatalogTab);
  },
  instantiate: () => storage,
  id: "catalog-previous-active-tab-storage",
});

export default catalogPreviousActiveTabStorageInjectable;
