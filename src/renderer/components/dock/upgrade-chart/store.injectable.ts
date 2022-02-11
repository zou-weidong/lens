/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { DockTabStore } from "../dock-tab.store";
import upgradeChartTabStorageInjectable from "./storage.injectable";
import { UpgradeChartTabStore } from "./store";

const upgradeChartTabStoreInjectable = getInjectable({
  instantiate: (di) => new UpgradeChartTabStore({
    valuesStore: new DockTabStore<string>(),
  }, {
    storage: di.inject(upgradeChartTabStorageInjectable),
  }),
  id: "upgrade-chart-tab-store",
});

export default upgradeChartTabStoreInjectable;
