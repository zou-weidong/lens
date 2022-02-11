/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";
import type { Stat } from "./stat.injectable";

const lstatInjectable = getInjectable({
  instantiate: (di): Stat => di.inject(fsInjectable).lstat,
  id: "lstat",
});

export default lstatInjectable;
