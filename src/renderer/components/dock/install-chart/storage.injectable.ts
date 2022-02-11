/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../../utils/storage/create.injectable";
import type { DockTabStorageState } from "../dock-tab.store";
import type { IChartInstallData } from "./store";

let storage: StorageLayer<DockTabStorageState<IChartInstallData>>;

const installChartTabStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("install_charts", {});
  },
  instantiate: () => storage,
  id: "install-chart-tab-storage",
});

export default installChartTabStorageInjectable;
