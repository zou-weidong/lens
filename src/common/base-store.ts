/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import ElectronStore from "electron-store";
import type { IEqualsComparer } from "mobx";
import { comparer, reaction } from "mobx";
import type { Disposer } from "./utils";
import { toJS } from "./utils";
import type { LensLogger } from "./logger";

export interface StoreSyncOptions<T> {
  fireImmediately?: boolean;
  equals?: IEqualsComparer<T>;
}

export interface BaseStoreParams<T> extends Omit<ElectronStore.Options<T>, "accessPropertiesByDotNotation" | "watch"> {
  syncOptions?: StoreSyncOptions<T>;
}

export interface BaseStoreDependencies {
  readonly userDataPath: string;
  readonly logger: LensLogger;
}

/**
 * `T` MUST be JSON serializable
 */
export abstract class BaseStore<T> {
  protected storeConfig?: ElectronStore<T>;
  protected syncDisposers: Disposer[] = [];
  protected readonly syncOptions: StoreSyncOptions<T>;
  protected readonly params: ElectronStore.Options<T>;
  protected readonly logger: LensLogger;

  constructor({ logger, userDataPath }: BaseStoreDependencies, baseStoreParams: BaseStoreParams<T>) {
    const {
      syncOptions = {
        equals: comparer.structural,
      },
      cwd = userDataPath,
      ...params
    } = baseStoreParams;

    this.syncOptions = syncOptions;
    this.logger = logger;
    this.params = {
      ...params,
      cwd,
      accessPropertiesByDotNotation: false,
      watch: true,
    };
  }

  /**
   * This must be called after the last child's constructor is finished (or just before it finishes)
   */
  load() {
    if (this.storeConfig) {
      throw new Error(`Cannot load store for ${this.params.name} more than once`);
    }

    this.logger.info(`LOADING ...`);

    this.storeConfig = new ElectronStore(this.params);
    const res: any = this.fromStore(this.storeConfig.store);

    if (res instanceof Promise || (typeof res === "object" && res && typeof res.then === "function")) {
      this.logger.error(`This class's fromStore implementation returns a Promise or promise-like object. This is an error and MUST be fixed.`);
    }

    // Setup sync from file
    this.storeConfig.onDidAnyChange(model => {
      this.logger.debug("fromStore", model);
      this.fromStore(model);
    });

    // Setup sync to file
    reaction(
      () => toJS(this.toJSON()),
      model => this.saveToFile(model),
      this.syncOptions,
    );

    this.logger.info(`LOADED`);
  }

  protected saveToFile(model: T) {
    this.logger.info(`SAVING...`);

    // todo: update when fixed https://github.com/sindresorhus/conf/issues/114
    for (const [key, value] of Object.entries(model)) {
      this.storeConfig.set(key, value);
    }
  }

  /**
   * fromStore is called internally when a child class syncs with the file
   * system.
   *
   * Note: This function **must** be synchronous.
   *
   * @param data the parsed information read from the stored JSON file
   */
  protected abstract fromStore(data: T): void;

  /**
   * toJSON is called when syncing the store to the filesystem. It should
   * produce a JSON serializable object representation of the current state.
   *
   * It is recommended that a round trip is valid. Namely, calling
   * `this.fromStore(this.toJSON())` shouldn't change the state.
   */
  abstract toJSON(): T;
}
