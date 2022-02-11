/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Dirent } from "fs";
import fsInjectable from "./fs.injectable";

export type ReadDirEntryOptions = { encoding?: BufferEncoding | string | null | undefined; withFileTypes: true };
export type ReadDirFileBufferOptions = "buffer" | { encoding: "buffer"; withFileTypes?: false | undefined };
export type ReadDirFileNameOptions = { encoding: BufferEncoding | string | null | undefined; withFileTypes?: false | undefined }
  | BufferEncoding
  | string
  | null;

export interface ReadDir {
  (path: string, options: ReadDirFileBufferOptions): Promise<Buffer[]>;
  (path: string, options?: ReadDirFileNameOptions): Promise<string[]>;
  (path: string, options: ReadDirEntryOptions): Promise<Dirent[]>;
}

const readDirInjectable = getInjectable({
  id: "read-dir",
  instantiate: (di): ReadDir => di.inject(fsInjectable).readdir,
});

export default readDirInjectable;
