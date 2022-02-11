/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, observable, makeObservable, computed } from "mobx";
import type { BaseStoreDependencies, BaseStoreParams } from "../base-store";
import { BaseStore } from "../base-store";
import { iter, toJS } from "../utils";
import type { CreateHotbarData, CreateHotbarOptions } from "./hotbar-types";
import { defaultHotbarCells } from "./hotbar-types";
import type { HotbarModel, Hotbar } from "./hotbar";
import { merge } from "lodash";
import { catalogEntity } from "../../main/catalog/local-sources/general/view-catalog-entity";

export enum OrderDirection {
  NEXT = 1,
  PREVIOUS = -1,
}

export interface HotbarStoreModel {
  hotbars: [string, HotbarModel][];
  activeHotbarId: string;
}

interface Dependencies extends BaseStoreDependencies {
  createHotbar: (data: CreateHotbarData) => [string, Hotbar];
}

export class HotbarStore extends BaseStore<HotbarStoreModel> {
  readonly hotbars = observable.map<string, Hotbar>();
  @observable private _activeHotbarId: string;

  constructor(protected readonly dependencies: Dependencies, params: BaseStoreParams<HotbarStoreModel>) {
    super(dependencies, {
      ...params,
      name: "lens-hotbar-store",
    });
    makeObservable(this);
  }

  @computed
  get activeHotbarId() {
    return this._activeHotbarId;
  }

  /**
   * If `hotbar` points to a known hotbar, make it active. Otherwise, ignore
   * @param hotbar The hotbar instance, or the index, or its ID
   */
  setActiveHotbar(id: string) {
    if (this.hotbars.has(id)) {
      this._activeHotbarId = id;
    }
  }

  private setFirstAsActive() {
    this._activeHotbarId = iter.first(this.hotbars.keys());
  }

  @action
  protected fromStore(data: Partial<HotbarStoreModel> = {}) {
    if (!data.hotbars || !data.hotbars.length) {
      const [id, hotbar] = this.dependencies.createHotbar({ name: "Default" });
      const { metadata: { uid, name, source }} = catalogEntity;
      const initialItem = { entity: { uid, name, source }};

      hotbar.items[0] = initialItem;

      this.hotbars.replace([id, hotbar]);
    } else {
      this.hotbars.replace(data.hotbars.map(([id, model]) => {
        if (this.hotbars.has(id)) {
          // This is done so that users who hold on to instances continue to work
          const prev = this.hotbars.get(id);

          prev.name = model.name;
          merge(prev.items, model.items);

          return [id, prev];
        }

        return [id, this.dependencies.createHotbar(model)];
      }));
    }

    this.hotbars.forEach(ensureExactHotbarItemLength);

    if (data.activeHotbarId) {
      this.setActiveHotbar(data.activeHotbarId);
    }

    if (!this.activeHotbarId) {
      this.setFirstAsActive();
    }
  }

  toJSON(): HotbarStoreModel {
    return toJS({
      hotbars: [...iter.map(this.hotbars, ([id, hotbar]) => [id, hotbar.toJSON()])],
      activeHotbarId: this.activeHotbarId,
    } as HotbarStoreModel);
  }

  @action
  add(data: CreateHotbarData, { setActive = false }: CreateHotbarOptions = {}): void {
    const [id, hotbar] = this.dependencies.createHotbar(data);

    this.hotbars.set(id, hotbar);

    if (setActive) {
      this._activeHotbarId = id;
    }
  }

  @action
  remove(id: string): void {
    if (this.hotbars.size <= 1) {
      throw new Error("Cannot remove the last hotbar");
    }

    this.hotbars.delete(id);

    if (this.activeHotbarId === id) {
      this.setFirstAsActive();
    }
  }

  private getActiveHotbarIndex() {
    let i = 0;

    for (const id of this.hotbars.keys()) {
      if (id === this._activeHotbarId) {
        return i;
      }

      i += 1;
    }

    // This should NEVER happen, it means that `this._activeHotbarId` is invalid
    return 0;
  }

  private getNextIndex(direction: 1 | -1) {
    const potentialNextIndex = this.getActiveHotbarIndex() + direction;

    if (potentialNextIndex < 0) {
      return this.hotbars.size - 1;
    }

    if (potentialNextIndex >= this.hotbars.size) {
      return 0;
    }

    return potentialNextIndex;
  }

  private setActiveByIndex(index: number) {
    this._activeHotbarId = iter.nth(this.hotbars.keys(), index);
  }

  switchHotbar(direction: OrderDirection): void {
    this.setActiveByIndex(this.getNextIndex(direction));
  }

  /**
   * Get the display index (1-base) of the hotbar provided
   */
  getDisplayIndex(hotbar: Hotbar): string {
    let i = 0;

    for (const entry of this.hotbars.values()) {
      i += 1;

      if (entry === hotbar) {
        return `${i}`;
      }
    }

    return "??";
  }
}

/**
 * This function ensures that there are always exactly `defaultHotbarCells`
 * worth of items in the hotbar.
 * @param hotbar The hotbar to modify
 */
function ensureExactHotbarItemLength(hotbar: Hotbar) {
  // if there are not enough items
  while (hotbar.items.length < defaultHotbarCells) {
    hotbar.items.push(null);
  }

  // if for some reason the hotbar was overfilled before, remove as many entries
  // as needed, but prefer empty slots and items at the end first.
  while (hotbar.items.length > defaultHotbarCells) {
    const lastNull = hotbar.items.lastIndexOf(null);

    if (lastNull >= 0) {
      hotbar.items.splice(lastNull, 1);
    } else {
      hotbar.items.length = defaultHotbarCells;
    }
  }
}
