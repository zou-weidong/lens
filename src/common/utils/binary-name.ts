/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { normalizedPlatform } from "../vars";

export function getBinaryName(name: string, { forPlatform = normalizedPlatform } = {}): string {
  if (forPlatform === "windows") {
    return `${name}.exe`;
  }

  return name;
}
