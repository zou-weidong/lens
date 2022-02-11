/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../../utils/storage/create.injectable";
import type { TableStorageModel } from "./table-model";

let storage: StorageLayer<TableStorageModel>;

const tableModelStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("table_settings", {
      sortParams: {},
    });
  },
  instantiate: () => storage,
  id: "table-model-storage",
});

export default tableModelStorageInjectable;
