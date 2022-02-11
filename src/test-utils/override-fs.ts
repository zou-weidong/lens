/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";
import accessInjectable from "../common/fs/access.injectable";
import copyDirInjectable from "../common/fs/copy-dir.injectable";
import createReadStreamInjectable from "../common/fs/create-read-stream.injectable";
import createWatcherInjectable from "../common/fs/create-watcher.injectable";
import dirExistsInjectable from "../common/fs/dir-exists.injectable";
import ensureDirInjectable from "../common/fs/ensure-dir.injectable";
import lstatInjectable from "../common/fs/lstat.injectable";
import moveInjectable from "../common/fs/move.injectable";
import pathExistsInjectable from "../common/fs/path-exists.injectable";
import readDirInjectable from "../common/fs/read-dir.injectable";
import readFileInjectable from "../common/fs/read-file.injectable";
import readJsonFileInjectable from "../common/fs/read-json-file.injectable";
import removeInjectable from "../common/fs/remove.injectable";
import statInjectable from "../common/fs/stat.injectable";
import unlinkInjectable from "../common/fs/unlink.injectable";
import writeFileInjectable from "../common/fs/write-file.injectable";
import writeJsonFileInjectable from "../common/fs/write-json-file.injectable";

function getErrorMessage(middle: string): string {
  return `Tried to ${middle} from the file system without specifying an explicit override.`;
}

function getErrorThrower(middle: string): () => never {
  return () => {
    throw new Error(getErrorMessage(middle));
  };
}

export function overrideFs(di: DiContainer) {
  di.override(accessInjectable, getErrorThrower("access a file"));
  di.override(copyDirInjectable, getErrorThrower("copy a directory"));
  di.override(createReadStreamInjectable, getErrorThrower("create a read stream of a file"));
  di.override(createWatcherInjectable, getErrorThrower("watch changes"));
  di.override(dirExistsInjectable, getErrorThrower("check if a directory exists"));
  di.override(ensureDirInjectable, getErrorThrower("ensure that a directory exists"));
  di.override(lstatInjectable, getErrorThrower("stat a path without following symlinks"));
  di.override(moveInjectable, getErrorThrower("move a file to a different path"));
  di.override(pathExistsInjectable, getErrorThrower("check if a path exists"));
  di.override(readDirInjectable, getErrorThrower("read contents of a directory"));
  di.override(readFileInjectable, getErrorThrower("read a file"));
  di.override(readJsonFileInjectable, getErrorThrower("read a JSON file"));
  di.override(removeInjectable, getErrorThrower("remove a directory recursively"));
  di.override(statInjectable, getErrorThrower("stat a symlink followed path"));
  di.override(unlinkInjectable, getErrorThrower("remove a file"));
  di.override(writeFileInjectable, getErrorThrower("write a file"));
  di.override(writeJsonFileInjectable, getErrorThrower("write a JSON file"));
}
