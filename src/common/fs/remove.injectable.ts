/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type Remove = (path: string) => Promise<void>;

const removeInjectable = getInjectable({
  instantiate: (di): Remove => di.inject(fsInjectable).remove,
  id: "remove",
});

export default removeInjectable;
