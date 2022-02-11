/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import glob from "glob";
import { memoize, kebabCase } from "lodash/fp";
import { createContainer } from "@ogre-tools/injectable";
import { setLegacyGlobalDiForExtensionApi } from "../extensions/di-legacy-globals/setup";
import baseLoggerInjectable from "./logger/base-logger.injectable";
import getAppPathInjectable from "./electron/get-app-path.injectable";
import setAppPathInjectable from "./electron/set-app-path.injectable";
import ipcMainInjectable from "./ipc/ipc-main.injectable";
import type { GetDiForUnitTestingArgs } from "../test-utils/common-types";
import { overrideFs } from "../test-utils/override-fs";
import { registerInjectables } from "../test-utils/register-injectables";
import { overrideStores } from "../test-utils/override-stores/main";
import appNameInjectable from "../common/vars/app-name.injectable";
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
    di.override(ipcMainInjectable, () => ({
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
      handle: jest.fn(),
      handleOnce: jest.fn(),
      removeHandler: jest.fn(),
    }));

    di.override(
      getAppPathInjectable,
      () => (name: string) => `some-electron-app-path-for-${kebabCase(name)}`,
    );

    di.override(setAppPathInjectable, () => () => undefined);
    di.override(appNameInjectable, () => "some-electron-app-name");
  }

  if (doStoresOverrides) {
    const storesToSkip = Array.isArray(doStoresOverrides)
      ? doStoresOverrides
      : undefined;

    overrideStores(di, storesToSkip);
  }

  return di;
}
