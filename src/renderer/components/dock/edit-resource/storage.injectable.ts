/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../../utils/storage/create.injectable";
import type { DockTabStorageState } from "../dock-tab.store";
import type { EditingResource } from "./store";

let storage: StorageLayer<DockTabStorageState<EditingResource>>;

const editResourceTabStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("edit_resource_store", {});
  },
  instantiate: () => storage,
  id: "edit-resource-tab-storage",
});

export default editResourceTabStorageInjectable;
