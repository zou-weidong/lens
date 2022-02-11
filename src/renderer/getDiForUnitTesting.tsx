/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { memoize } from "lodash/fp";
import { createContainer } from "@ogre-tools/injectable";
import { setLegacyGlobalDiForExtensionApi } from "../extensions/di-legacy-globals/setup";
import ipcRendererInjectable from "./ipc/ipc-renderer.injectable";
import type { GetDiForUnitTestingArgs } from "../test-utils/common-types";
import { overrideFs } from "../test-utils/override-fs";
import { registerInjectables } from "../test-utils/register-injectables";
import historyInjectable from "./navigation/history.injectable";
import { createMemoryHistory } from "history";
import { overrideStores } from "../test-utils/override-stores/renderer";
import baseLoggerInjectable from "./logger/base-logger.injectable";
import createStoresAndApisInjectable from "./vars/is-cluster-page-context.injectable";

const getInjectableFilePaths = memoize(() => [
  ...glob.sync(`${__dirname}/**/*.injectable.{ts,tsx}`),
  ...glob.sync(`${__dirname}/../common/**/*.injectable.{ts,tsx}`),
  ...glob.sync(`${__dirname}/../extensions/**/*.injectable.{ts,tsx}`),
]);

export function getDiForUnitTesting({
  doGeneralOverrides = true,
  doFileSystemOverrides = true,
  doStoresOverrides = true,
  doLoggingOverrides = true,
}: GetDiForUnitTestingArgs = {}) {
  const di = createContainer();

  setLegacyGlobalDiForExtensionApi(di);
  registerInjectables(di, getInjectableFilePaths);
  di.preventSideEffects();

  if (doFileSystemOverrides) {
    overrideFs(di);
  }

  if (doLoggingOverrides) {
    di.override(baseLoggerInjectable, () => ({
      debug: jest.fn(),
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }));
  }

  if (doGeneralOverrides) {
    di.override(createStoresAndApisInjectable, () => true);
    di.override(ipcRendererInjectable, () => ({
      on: jest.fn(),
      off: jest.fn(),
      invoke: jest.fn(),
      once: jest.fn(),
      postMessage: jest.fn(),
      removeAllListeners: jest.fn(),
      removeListener: jest.fn(),
      addListener: jest.fn(),
      send: jest.fn(),
      sendSync: jest.fn(),
      sendTo: jest.fn(),
      sendToHost: jest.fn(),
      setMaxListeners: jest.fn(),
      getMaxListeners: jest.fn(),
      emit: jest.fn(),
      eventNames: jest.fn(),
      listenerCount: jest.fn(),
      listeners: jest.fn(),
      prependListener: jest.fn(),
      prependOnceListener: jest.fn(),
      rawListeners: jest.fn(),
    }));
    di.override(historyInjectable, () => createMemoryHistory());
  }

  if (doStoresOverrides) {
    const storesToSkip = Array.isArray(doStoresOverrides)
      ? doStoresOverrides
      : undefined;

    overrideStores(di, storesToSkip);
  }

  return di;
}
