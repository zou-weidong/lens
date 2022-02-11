/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { AppPaths } from "../../../common/ipc/electron/app-paths.token";
import { appPathsInjectionToken } from "../../../common/ipc/electron/app-paths.token";
import getAppPathsInjectable from "./get-app-paths.injectable";

let appPaths: AppPaths;

const appPathsInjectable = getInjectable({
  setup: async (di) => {
    const getAppPaths = await di.inject(getAppPathsInjectable);

    appPaths = await getAppPaths();
  },
  instantiate: () => appPaths,
  injectionToken: appPathsInjectionToken,
  id: "app-paths",
});

export default appPathsInjectable;
