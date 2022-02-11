/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../../utils/storage/create.injectable";
import type { DockTabStorageState } from "../dock-tab.store";

let storage: StorageLayer<DockTabStorageState<string>>;

const createResourceTabStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("create_resource", {});
  },
  instantiate: () => storage,
  id: "create-resource-tab-storage",
});

export default createResourceTabStorageInjectable;
