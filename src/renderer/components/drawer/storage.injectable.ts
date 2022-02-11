/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../utils/storage/create.injectable";

export const defaultDrawerWidth = 725;

export interface DrawerStorageState {
  width: number;
}

let storage: StorageLayer<DrawerStorageState>;

const drawerStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("drawer", {
      width: defaultDrawerWidth,
    });
  },
  instantiate: () => storage,
  id: "drawer-storage",
});

export default drawerStorageInjectable;
