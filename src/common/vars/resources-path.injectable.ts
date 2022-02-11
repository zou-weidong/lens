/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import isDevelopmentInjectable from "./is-development.injectable";

const resourcesPathInjectable = getInjectable({
  id: "resources-path",
  instantiate: (di) => (
    di.inject(isDevelopmentInjectable)
      ? process.cwd()
      : process.resourcesPath
  ),
});

export default resourcesPathInjectable;
