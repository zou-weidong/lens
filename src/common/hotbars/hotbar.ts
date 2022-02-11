/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { action, makeObservable, observable } from "mobx";
import type { CatalogEntity } from "../catalog/entity";
import type { LensLogger } from "../logger";
import { toJS } from "../utils";
import type { HotbarItems } from "./hotbar-types";
import type { OnTooManyHotbarItems } from "./too-many-items.token";

export interface HotbarModel {
  name: string;
  items: HotbarItems;
}

export interface HotbarDependencies {
  readonly logger: LensLogger;
  onTooManyHotbarItems: OnTooManyHotbarItems;
}

export class Hotbar {
  @observable public name: string;
  @observable public readonly items: HotbarItems;

  constructor(protected readonly dependencies: HotbarDependencies, name: string, items: HotbarItems) {
    this.name = name;
    this.items = items;

    makeObservable(this);
  }

  has(entity: CatalogEntity) {
    return this.items.findIndex(item => item?.entity.uid === entity.getId()) >= 0;
  }

  @action
  add(entity: CatalogEntity, cellIndex?: number): void {
    const uid = entity.getId();
    const name = entity.getName();

    if (typeof uid !== "string") {
      throw new TypeError("CatalogEntity's ID must be a string");
    }

    if (typeof name !== "string") {
      throw new TypeError("CatalogEntity's NAME must be a string");
    }

    if (this.has(entity)) {
      return;
    }

    const newItem = {
      entity: {
        uid,
        name,
        source: entity.metadata.source,
      },
    };

    if (cellIndex === undefined) {
      // Add item to empty cell
      const emptyCellIndex = this.items.indexOf(null);

      if (emptyCellIndex != -1) {
        this.items[emptyCellIndex] = newItem;
      } else {
        this.dependencies.onTooManyHotbarItems();
      }
    } else if (0 <= cellIndex && cellIndex < this.items.length) {
      this.items[cellIndex] = newItem;
    } else {
      this.dependencies.logger.error(`cannot pin entity to hotbar outside of index range`, { entityId: uid, cellIndex });
    }
  }

  @action
  remove(uid: string): void {
    const index = this.items.findIndex(item => item?.entity.uid === uid);

    if (index < 0) {
      return;
    }

    this.items[index] = null;
  }

  private findClosestEmptyIndex(from: number, direction: 1 | -1) {
    let index = from;

    while(this.items[index] != null) {
      index += direction;
    }

    return index;
  }

  @action
  restackItems(from: number, to: number): void {
    const source = this.items[from];
    const moveDown = from < to;

    if (from < 0 || to < 0 || from >= this.items.length || to >= this.items.length || isNaN(from) || isNaN(to)) {
      throw new Error("Invalid 'from' or 'to' arguments");
    }

    if (from == to) {
      return;
    }

    this.items.splice(from, 1, null);

    if (this.items[to] == null) {
      this.items.splice(to, 1, source);
    } else {
      // Move cells up or down to closes empty cell
      this.items.splice(this.findClosestEmptyIndex(to, moveDown ? -1 : 1), 1);
      this.items.splice(to, 0, source);
    }
  }

  toJSON(): HotbarModel {
    return {
      name: this.name,
      items: toJS(this.items),
    };
  }
}
