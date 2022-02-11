/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { EnsureOptions, WriteOptions } from "fs-extra";
import path from "path";
import fsInjectable from "./fs.injectable";

export type WriteFile = (filePath: string, data: string | Buffer, options?: WriteOptions | BufferEncoding) => Promise<void>;

interface Dependencies {
  writeFile: (file: string, data: string | Buffer, options?: WriteOptions | BufferEncoding | string) => Promise<void>;
  ensureDir: (dir: string, options?: EnsureOptions | number) => Promise<void>;
}

const writeFile = ({ writeFile, ensureDir }: Dependencies): WriteFile => (
  async (filePath, data, rawOptions) => {
    const options: WriteOptions = typeof rawOptions === "string"
      ? {
        encoding: rawOptions,
      }
      : rawOptions;

    options.mode ??= 0o755;
    options.encoding ??= "utf-8";

    await ensureDir(path.dirname(filePath), options);
    await writeFile(filePath, data, options);
  }
);

const writeFileInjectable = getInjectable({
  instantiate: (di) => writeFile(di.inject(fsInjectable)),
  id: "write-file",
});

export default writeFileInjectable;
