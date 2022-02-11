/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, observable, reaction } from "mobx";
import { autoBind, toJS } from "../../utils";
import type { StorageLayer } from "../../utils/storage/create.injectable";
import type { TabId } from "./dock/store";

export interface DockTabStoreOptions<T> {
  readonly storage?: StorageLayer<DockTabStorageState<T>>;
}

export type DockTabStorageState<T> = Record<TabId, T>;

export class DockTabStore<T> {
  protected readonly storage?: StorageLayer<DockTabStorageState<T>>;
  private data = observable.map<TabId, T>();

  constructor(options?: DockTabStoreOptions<T>) {
    autoBind(this);

    this.storage = options?.storage;
    this.data.replace(this.storage.get());
    reaction(() => this.toJSON(), data => this.storage.set(data));
  }

  protected finalizeDataForSave(data: T): T {
    return data;
  }

  protected toJSON(): DockTabStorageState<T> {
    const deepCopy = toJS(this.data);

    deepCopy.forEach((tabData, key) => {
      deepCopy.set(key, this.finalizeDataForSave(tabData));
    });

    return Object.fromEntries<T>(deepCopy);
  }

  protected getAllData() {
    return this.data.toJSON();
  }

  findTabIdFromData(inspecter: (val: T) => any): TabId | undefined {
    for (const [tabId, data] of this.data) {
      if (inspecter(data)) {
        return tabId;
      }
    }

    return undefined;
  }

  isReady(tabId: TabId): boolean {
    return this.getData(tabId) !== undefined;
  }

  getData(tabId: TabId) {
    return this.data.get(tabId);
  }

  setData(tabId: TabId, data: T) {
    this.data.set(tabId, data);
  }

  clearData(tabId: TabId) {
    this.data.delete(tabId);
  }

  @action
  reset() {
    for (const tabId of this.data.keys()) {
      this.clearData(tabId);
    }
    this.storage?.reset();
  }
}
