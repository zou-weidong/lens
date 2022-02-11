/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import directoryForLensLocalStorageInjectable from "../../../common/paths/local-storage.injectable";
import type { ReadJsonFile } from "../../../common/fs/read-json-file.injectable";
import readJsonFileInjectable from "../../../common/fs/read-json-file.injectable";
import type { WriteJsonFile } from "../../../common/fs/write-json-file.injectable";
import writeJsonFileInjectable from "../../../common/fs/write-json-file.injectable";
import type { JsonObject, JsonValue } from "type-fest";
import storageLoggerInjectable from "./logger.injectable";
import createStorageHelperInjectable from "./create-helper.injectable";
import type { IObservableValue } from "mobx";
import { reaction, toJS, comparer, observable } from "mobx";
import type { LensLogger } from "../../../common/logger";
import path from "path";
import type { Draft } from "immer";
import type { ClusterId } from "../../../common/clusters/cluster-types";
import hostedClusterIdInjectable from "../../clusters/hosted-cluster-id.injectable";

export type CreateStorage = <T>(key: string, defaultValue: T) => JsonValue extends T
  ? StorageLayer<T>
  : never;

export interface StorageLayer<T> {
  get(): T;
  set(val: T): void;
  reset(): void;
  merge(value: Partial<T> | ((draft: Draft<T>) => Partial<T> | void)): void;
}

interface InitStorageDependencies {
  directoryForLensLocalStorage: string;
  readJsonFile: ReadJsonFile;
  writeJsonFile: WriteJsonFile;
  logger: LensLogger;
  storage: IObservableValue<JsonObject>;
  clusterId: ClusterId | undefined;
}

const initStorage = async ({
  directoryForLensLocalStorage,
  readJsonFile,
  writeJsonFile,
  logger,
  storage,
  clusterId,
}: InitStorageDependencies) => {
  const filePath = path.resolve(directoryForLensLocalStorage, `${clusterId || "app"}.json`);

  try {
    const value = await readJsonFile(filePath);

    if (typeof value === "object" && !Array.isArray(value)) {
      storage.set(value);
    }
  } catch {
  // ignore error
  } finally {
    logger.info(`loading finished for ${filePath}`);
  }

  // bind auto-saving data changes to %storage-file.json
  reaction(() => toJS(storage.get()), saveFile, {
    delay: 250, // lazy, avoid excessive writes to fs
    equals: comparer.structural, // save only when something really changed
  });

  async function saveFile(state: Record<string, any> = {}) {
    logger.info(`saving ${filePath}`);

    try {
      await writeJsonFile(filePath, state);
    } catch (error) {
      logger.error(`saving failed: ${error}`, {
        json: state, jsonFilePath: filePath,
      });
    }
  }
};

let createStorage: CreateStorage;

const createStorageInjectable = getInjectable({
  setup: async (di) => {
    const storage = observable.box<JsonObject>({});
    const createStorageHelper = await di.inject(createStorageHelperInjectable);

    await initStorage({
      readJsonFile: await di.inject(readJsonFileInjectable),
      writeJsonFile: await di.inject(writeJsonFileInjectable),
      directoryForLensLocalStorage: await di.inject(directoryForLensLocalStorageInjectable),
      logger: await di.inject(storageLoggerInjectable),
      clusterId: await di.inject(hostedClusterIdInjectable),
      storage,
    });

    createStorage = <T>(key: string, defaultValue: T) => createStorageHelper({
      key,
      defaultValue,
      storage: {
        getItem(key) {
          return storage.get()[key] as T;
        },
        setItem(key, value) {
          storage.get()[key] = value;
        },
        removeItem(key) {
          delete storage.get()[key];
        },
      },
    }) as never;
  },
  instantiate: () => createStorage,
  id: "create-storage",
});

export default createStorageInjectable;
