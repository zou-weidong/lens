/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import directoryForIntegrationTestingInjectable from "../../common/paths/integration-testing.injectable";
import { pathNames } from "../../common/ipc/electron/app-path-names";
import { appPathsInjectionToken } from "../../common/ipc/electron/app-paths.token";
import { fromEntries } from "../../common/utils";
import getAppPathInjectable from "./get-app-path.injectable";
import setAppPathInjectable from "./set-app-path.injectable";
import appNameInjectable from "../../common/vars/app-name.injectable";

const appPathsInjectable = getInjectable({
  instantiate: (di) => {
    const directoryForIntegrationTesting = di.inject(directoryForIntegrationTestingInjectable);
    const setAppPath = di.inject(setAppPathInjectable);
    const getAppPath = di.inject(getAppPathInjectable);
    const appName = di.inject(appNameInjectable);

    if (directoryForIntegrationTesting) {
      // Todo: this kludge is here only until we have a proper place to setup integration testing.
      setAppPath("appData", directoryForIntegrationTesting);
    }

    setAppPath("userData", path.join(getAppPath("appData"), appName));

    return fromEntries(pathNames.map((name) => [name, getAppPath(name)]));
  },
  injectionToken: appPathsInjectionToken,
  id: "app-paths",
});

export default appPathsInjectable;
