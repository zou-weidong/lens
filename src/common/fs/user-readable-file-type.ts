/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Stats } from "fs";

export function userReadableFileType(stats: Stats): string {
  if (stats.isFile()) {
    return "a file";
  }

  if (stats.isFIFO()) {
    return "a pipe";
  }

  if (stats.isSocket()) {
    return "a socket";
  }

  if (stats.isBlockDevice()) {
    return "a block device";
  }

  if (stats.isCharacterDevice()) {
    return "a character device";
  }

  return "an unknown file type";
}
