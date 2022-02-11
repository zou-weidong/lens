/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import type { PathName } from "../../common/ipc/electron/app-path-names";
import electronAppInjectable from "./app.injectable";

export type SetAppPath = (pathName: PathName, value: string) => void;

const setAppPathInjectable = getInjectable({
  id: "set-app-path",
  instantiate: (di): SetAppPath => {
    const app = di.inject(electronAppInjectable);

    return (pathName, value) => app.setPath(pathName, value);
  },
});

export default setAppPathInjectable;
