/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { PathLike, ReadStream } from "fs";
import fsInjectable from "./fs.injectable";

export interface CreateReadStreamOptions {
  flags?: string | undefined;
  encoding?: BufferEncoding | undefined;
  fd?: number | undefined;
  mode?: number | undefined;
  autoClose?: boolean | undefined;
  /**
   * @default false
   */
  emitClose?: boolean | undefined;
  start?: number | undefined;
  end?: number | undefined;
  highWaterMark?: number | undefined;
}
export type CreateReadStream = (path: PathLike, options?: BufferEncoding | CreateReadStreamOptions) =>  ReadStream;

const createReadStreamInjectable = getInjectable({
  instantiate: (di) => di.inject(fsInjectable).createReadStream as CreateReadStream,
  id: "create-read-stream",
});

export default createReadStreamInjectable;
