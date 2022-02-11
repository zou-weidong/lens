/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Helper for working with storages (e.g. window.localStorage, NodeJS/file-system, etc.)
import { action, IObservableValue, makeObservable, observe, toJS } from "mobx";
import { produce, Draft, isDraft } from "immer";
import { isEqual, isPlainObject } from "lodash";
import type { LensLogger } from "../../../common/logger";
import { once } from "lodash/fp";

export interface StorageAdapter<T> {
  [metadata: string]: any;
  getItem(key: string): T | Promise<T>;
  setItem(key: string, value: T): void;
  removeItem(key: string): void;
  onChange?(change: { key: string; value: T; oldValue?: T }): void;
}

export interface StorageHelperOptions<T> {
  readonly storage: StorageAdapter<T>;
  readonly defaultValue: T;
  readonly key: string;
}

export interface StorageHelperDependencies {
  readonly logger: LensLogger;
}

export class StorageHelper<T> {
  readonly storage: StorageAdapter<T>;
  private readonly data: IObservableValue<T>;

  public readonly key: string;

  #initialized = false;
  get initialized() {
    return this.#initialized;
  }

  protected getDefaultValue: () => T;

  constructor(protected readonly dependencies: StorageHelperDependencies, options: StorageHelperOptions<T>) {
    makeObservable(this);

    this.storage = options.storage;
    this.key = options.key;
    this.getDefaultValue = () => options.defaultValue;

    const onChange = (value: T, oldValue?: T) => {
      try {
        if (value == null) {
          this.storage.removeItem(this.key);
        } else {
          this.storage.setItem(this.key, value);
        }

        this.storage.onChange?.({ value, oldValue, key: this.key });
      } catch (error) {
        this.dependencies.logger.error(`updating storage: ${error}`, { this: this, value, oldValue });
      }
    };

    const onFinally = once(() => {
      this.#initialized = true;
      observe(this.data, (change) => {
        onChange(change.newValue as T, change.oldValue as T);
      });
    });

    const onData = (data: T): void => {
      const notEmpty = data != null;
      const notDefault = !this.isDefaultValue(data);

      if (notEmpty && notDefault) {
        this.set(data);
      }
    };

    const onError = (error: any): void => {
      this.dependencies.logger.error(`loading error: ${error}`, this);
    };

    try {
      const data = this.storage.getItem(this.key);

      if (data instanceof Promise) {
        data.then(onData, onError).finally(onFinally);
      } else {
        onData(data);

        // This is not in a `finally` block so that it isn't double called
        onFinally();
      }
    } catch (error) {
      onError(error);

      // This is not in a `finally` block so that it isn't double called
      onFinally();
    }
  }

  isDefaultValue(value: T): boolean {
    return isEqual(value, this.getDefaultValue());
  }

  get(): T {
    return this.data.get() ?? this.getDefaultValue();
  }

  set(value: T) {
    if (this.isDefaultValue(value)) {
      this.reset();
    } else {
      this.data.set(value);
    }
  }

  reset() {
    this.data.set(undefined);
  }

  @action
  merge(value: Partial<T> | ((draft: Draft<T>) => Partial<T> | void)) {
    const nextValue = produce<T>(this.toJSON(), (draft: Draft<T>) => {

      if (typeof value == "function") {
        const newValue = value(draft);

        // merge returned plain objects from `value-as-callback` usage
        // otherwise `draft` can be just modified inside a callback without returning any value (void)
        if (newValue && !isDraft(newValue)) {
          Object.assign(draft, newValue);
        }
      } else if (isPlainObject(value)) {
        Object.assign(draft, value);
      }

      return draft;
    });

    this.set(nextValue);
  }

  toJSON(): T {
    return toJS(this.get());
  }
}
