/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Mode } from "fs";
import fsInjectable from "./fs.injectable";

export type Chmod = (path: string, mode: Mode) => Promise<void>;

const chmodInjectable = getInjectable({
  id: "chmod",
  instantiate: (di): Chmod => di.inject(fsInjectable).chmod,
});

export default chmodInjectable;
