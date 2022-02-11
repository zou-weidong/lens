/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * Skip a test if a condition is true
 */
export function itIf(condition: boolean) {
  return condition ? it : it.skip;
}

/**
 * Skip a block of tests if a condition is true
 */
export function describeIf(condition: boolean) {
  return condition ? describe : describe.skip;
}
