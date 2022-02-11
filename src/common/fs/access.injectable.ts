/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type Access = (path: string, mode?: number) => Promise<void>;

const accessInjectable = getInjectable({
  instantiate: (di): Access => di.inject(fsInjectable).access,
  id: "access",
});

export default accessInjectable;
