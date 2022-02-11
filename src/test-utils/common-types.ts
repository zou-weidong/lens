/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { storeInjectionTokens } from "./override-stores/renderer";

export interface GetDiForUnitTestingArgs {
  /**
   * Override the filesystem dependencies to throw
   * @default true
   */
  doFileSystemOverrides?: boolean;

  /**
   * Override other general overrides
   * @default true
   */
  doGeneralOverrides?: boolean;

  /**
   * @default true
   */
  doLoggingOverrides?: boolean;

  /**
   * Override the `class extends BaseStore` types
   *
   * If a list of names is provided those will be SKIPPED
   * If `false` then all will be skipped
   * @default true
   */
  doStoresOverrides?: boolean | (keyof typeof storeInjectionTokens)[];
}
