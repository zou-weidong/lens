/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getAppPathsInjectionToken } from "../../../common/ipc/electron/get-app-paths.token";
import appPathsInjectable from "../../electron/app-paths.injectable";
import { implWithHandle } from "../impl-channel";

const getAppPathsInjectable = implWithHandle(getAppPathsInjectionToken, async (di) => {
  const appPaths = await di.inject(appPathsInjectable);

  return () => Promise.resolve(appPaths);
});

export default getAppPathsInjectable;
