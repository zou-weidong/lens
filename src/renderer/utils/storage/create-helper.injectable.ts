/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { StorageHelperDependencies, StorageHelperOptions } from "./helper";
import { StorageHelper } from "./helper";
import storageLoggerInjectable from "./logger.injectable";

export type CreateStorageHelper = <T>(opts: StorageHelperOptions<T>) => StorageHelper<T>;

const createStorageHelperInjectable = getInjectable({
  instantiate: (di): CreateStorageHelper => {
    const deps: StorageHelperDependencies = {
      logger: di.inject(storageLoggerInjectable),
    };

    return (opts) => new StorageHelper(deps, opts);
  },
  id: "create-storage-helper",
});

export default createStorageHelperInjectable;
