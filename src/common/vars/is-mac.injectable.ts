/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import platformInjectable from "./platform.injectable";

const isMacInjectable = getInjectable({
  id: "is-mac",
  instantiate: (di) => di.inject(platformInjectable) === "darwin",
});

export default isMacInjectable;
