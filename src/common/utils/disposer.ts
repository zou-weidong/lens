/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type Disposer = () => void;

interface Extendable<T> {
  push(...vals: T[]): void;
}

export type ExtendableDisposer = Disposer & Extendable<Disposer | { dispose: Disposer }>;

export function disposer(...args: (Disposer | undefined | null)[]): ExtendableDisposer {
  const res = () => {
    args.forEach(dispose => dispose?.());
    args.length = 0;
  };

  res.push = (...vals: (Disposer | { dispose: Disposer })[]) => {
    for (const val of vals) {
      if (typeof val === "function") {
        args.push(val);
      } else {
        args.push(() => val.dispose());
      }
    }
  };

  return res;
}
