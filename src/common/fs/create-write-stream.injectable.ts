/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PathLike, WriteStream } from "fs";
import fsInjectable from "./fs.injectable";

export interface CreateWriteStreamOptions {
  flags?: string | undefined;
  encoding?: BufferEncoding | undefined;
  fd?: number | undefined;
  mode?: number | undefined;
  autoClose?: boolean | undefined;
  emitClose?: boolean | undefined;
  start?: number | undefined;
  highWaterMark?: number | undefined;
}
export type CreateWriteStream = (path: PathLike, options?: BufferEncoding | CreateWriteStreamOptions) => WriteStream;

const createWriteStreamInjectable = getInjectable({
  instantiate: (di): CreateWriteStream => di.inject(fsInjectable).createWriteStream,
  id: "create-write-stream",
});

export default createWriteStreamInjectable;
