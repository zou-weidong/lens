/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ReadOptions } from "fs-extra";
import type { JsonValue } from "type-fest";
import fsInjectable from "./fs.injectable";

export type ReadJsonFile = (filePath: string, options?: string | ReadOptions) => Promise<JsonValue>;

const readJsonFileInjectable = getInjectable({
  id: "read-json-file",
  instantiate: (di): ReadJsonFile => di.inject(fsInjectable).readJson,
});

export default readJsonFileInjectable;
