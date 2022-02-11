/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../../utils/storage/create.injectable";

export interface SidebarStorageState {
  width: number;
  expanded: {
    [itemId: string]: boolean;
  };
}

export const defaultSidebarWidth = 200;

let storage: StorageLayer<SidebarStorageState>;

const sidebarStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("sidebar", {
      width: defaultSidebarWidth,
      expanded: {},
    });
  },
  instantiate: () => storage,
  id: "sidebar-storage",
});

export default sidebarStorageInjectable;
