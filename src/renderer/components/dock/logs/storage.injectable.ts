/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../../utils/storage/create.injectable";
import type { DockTabStorageState } from "../dock-tab.store";
import type { LogTabData } from "./tab-store";

let storage: StorageLayer<DockTabStorageState<LogTabData>>;

const logTabStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("pod_logs", {});
  },
  instantiate: () => storage,
  id: "log-tab-storage",
});

export default logTabStorageInjectable;
