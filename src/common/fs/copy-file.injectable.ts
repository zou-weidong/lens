/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export type CopyFile = (src: string, dest: string, flags?: number) => Promise<void>;

const copyFileInjectable = getInjectable({
  id: "copy-file",
  instantiate: (di): CopyFile => di.inject(fsInjectable).copyFile,
});

export default copyFileInjectable;
