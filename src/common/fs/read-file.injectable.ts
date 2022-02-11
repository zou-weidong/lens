/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fsInjectable from "./fs.injectable";

export interface ReadFileFlagOption {
  flag?: string | undefined;
}
export interface FullReadFileOptions extends ReadFileFlagOption {
  encoding: BufferEncoding | string;
}

export interface ReadFile {
  (file: string, options: ReadFileFlagOption | FullReadFileOptions | BufferEncoding): Promise<string>;
  (file: string): Promise<Buffer>;
}

const readFileInjectable = getInjectable({
  id: "read-file",
  instantiate: (di): ReadFile => di.inject(fsInjectable).readFile,
});

export default readFileInjectable;
