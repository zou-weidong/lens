/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import directoryForUserDataInjectable from "./user-data.injectable";

const extensionsNodeModulesDirectoryInjectable = getInjectable({
  instantiate: (di) => path.join(
    di.inject(directoryForUserDataInjectable),
    "node_modules",
  ),
  id: "extensions-node-modules-directory",
});

export default extensionsNodeModulesDirectoryInjectable;
