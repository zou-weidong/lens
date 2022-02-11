/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../../utils/storage/create.injectable";
import { DockStorageState, TabKind } from "./store";

let storage: StorageLayer<DockStorageState>;

const dockStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("dock", {
      height: 300,
      tabs: [
        {
          id: "terminal",
          kind: TabKind.TERMINAL,
          title: "Terminal",
          pinned: false,
        },
      ],
    });
  },
  instantiate: () => storage,
  id: "dock-storage",
});

export default dockStorageInjectable;
