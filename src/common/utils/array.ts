/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A inference typed version of `Array(length).fill(value)`
 * @param length The number of entries
 * @param value The value of each of the indices
 */
export function filled<T>(length: number, value: T): T[] {
  return Array(length).fill(value);
}

/**
 * Returns an empty array if check is `true`, otherwise return `src`.
 *
 * This is useful for spreading an optional array
 */
export function ignoreIf<T>(check: boolean, src: T[]) {
  return check ? [] : src;
}

/**
 * This function splits an array into two sub arrays on the first instance of
 * element (from the left). If the array does not contain the element. The
 * return value is defined to be `[array, [], false]`. If the element is in
 * the array then the return value is `[left, right, true]` where `left` is
 * the elements of `array` from `[0, index)` and `right` is `(index, length)`
 * @param src the full array to split into two sub-arrays
 * @param element the element in the middle of the array
 * @returns the left and right sub-arrays which when conjoined with `element`
 *          is the same as `array`, and `true`
 */
export function split<T>(src: T[], element: T): [T[], T[], boolean] {
  const index = src.indexOf(element);

  if (index < 0) {
    return [src, [], false];
  }

  return [src.slice(0, index), src.slice(index + 1, src.length), true];
}

/**
 * Splits an array into two parts based on the outcome of `condition`. If `true`
 * the value will be returned as part of the right array. If `false` then part of
 * the left array.
 * @param src the full array to bifurcate
 * @param condition the function to determine which set each is in
 */
export function bifurcate<T>(src: T[], condition: (item: T) => boolean): [falses: T[], trues: T[]] {
  const res: [T[], T[]] = [[], []];

  for (const item of src) {
    res[+condition(item)].push(item);
  }

  return res;
}
