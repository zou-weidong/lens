/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import resourcesPathInjectable from "./resources-path.injectable";

const directoryForStaticFilesInjectable = getInjectable({
  id: "directory-for-static-files",
  instantiate: (di) => path.resolve(
    di.inject(resourcesPathInjectable),
    "static",
  ),
});

export default directoryForStaticFilesInjectable;
