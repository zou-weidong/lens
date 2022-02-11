/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainer } from "@ogre-tools/injectable";

export function registerInjectables(di: DiContainer, getFilesPaths: () => string[]): void {
  for (const filePath of getFilesPaths()) {
    const injectableInstance = require(filePath).default;

    if (!injectableInstance) {
      throw new Error(`No default exported dependency from ${filePath}`);
    }

    di.register({
      id: filePath,
      ...injectableInstance,
      aliases: [injectableInstance, ...(injectableInstance.aliases || [])],
    });
  }
}
