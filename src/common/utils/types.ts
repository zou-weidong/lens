/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IMapEntry, ObservableMap } from "mobx";

/**
 * This type is useful for making sure that sync message types have a consistent
 * varient field.
 */
export interface SyncMessage<Variant extends string> {
  type: Variant;
}

/**
 * A readonly enhanced replacement for an observable map type
 */
export interface ReadonlyObservableMap<K, V> extends ObservableMap<K, V> {
  has(key: K): boolean;
  get(key: K): Readonly<V> | undefined;
  keys(): IterableIterator<K>;
  values(): IterableIterator<Readonly<V>>;
  entries(): IterableIterator<IMapEntry<K, Readonly<V>>>;
  readonly size: number;
  toJSON(): [K, V][];
  [Symbol.iterator](): IterableIterator<IMapEntry<K, Readonly<V>>>;

  /**
   * @deprecated Do not modify this type
   */
  set(key: K, value: V): this;

  /**
   * @deprecated Do not modify this type
   */
  delete(key: K): boolean;

  /**
   * @deprecated Do not modify this type
   */
  clear(): void;
}
