/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, computed, makeObservable } from "mobx";
import type { TabId } from "../dock/store";
import type { DockTabStoreOptions } from "../dock-tab.store";
import { DockTabStore } from "../dock-tab.store";
import { getReleaseValues } from "../../../../common/k8s-api/endpoints";

export interface ChartUpgradeData {
  releaseName: string;
  releaseNamespace: string;
}

interface Dependencies {
  readonly valuesStore: DockTabStore<string>;
}

export class UpgradeChartTabStore extends DockTabStore<ChartUpgradeData> {
  @computed private get releaseNameReverseLookup(): Map<string, string> {
    return new Map(this.getAllData().map(([id, { releaseName }]) => [releaseName, id]));
  }

  get values() {
    return this.dependencies.valuesStore;
  }

  constructor(protected readonly dependencies: Dependencies, opts: DockTabStoreOptions<ChartUpgradeData>) {
    super(opts);
    makeObservable(this);
  }

  @action
  async reloadValues(tabId: TabId) {
    this.values.clearData(tabId); // reset
    const { releaseName, releaseNamespace } = this.getData(tabId);
    const values = await getReleaseValues(releaseName, releaseNamespace, true);

    this.values.setData(tabId, values);
  }

  getTabIdByRelease(releaseName: string): TabId {
    return this.releaseNameReverseLookup.get(releaseName);
  }
}
