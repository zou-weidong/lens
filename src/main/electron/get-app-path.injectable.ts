/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { PathName } from "../../common/ipc/electron/app-path-names";
import electronAppInjectable from "./app.injectable";

export type GetAppPath = (pathName: PathName) => string | null;

const getAppPathInjectable = getInjectable({
  instantiate: (di): GetAppPath => {
    const app = di.inject(electronAppInjectable);

    return (pathName) => {
      try {
        return app.getPath(pathName);
      } catch {
        return null;
      }
    };
  },
  id: "get-app-path",
});

export default getAppPathInjectable;
