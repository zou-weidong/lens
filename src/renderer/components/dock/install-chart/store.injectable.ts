/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { InstallChartTabStore } from "./store";
import type { IReleaseUpdateDetails } from "../../../../common/k8s-api/endpoints";
import installChartTabStorageInjectable from "./storage.injectable";
import { DockTabStore } from "../dock-tab.store";

const installChartTabStoreInjectable = getInjectable({
  instantiate: (di) => new InstallChartTabStore({
    versionsStore: new DockTabStore<string[]>(),
    detailsStore: new DockTabStore<IReleaseUpdateDetails>(),
  }, {
    storage: di.inject(installChartTabStorageInjectable),
  }),
  id: "install-chart-tab-store",
});

export default installChartTabStoreInjectable;
