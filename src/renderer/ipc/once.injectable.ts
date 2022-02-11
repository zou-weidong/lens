/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "../utils";
import rawOnceInjectable from "./raw-once.injectable";

export type Once = (channel: string, listener: (...args: any[]) => void) => Disposer;

const onceInjectable = getInjectable({
  instantiate: (di): Once => {
    const rawOnce = di.inject(rawOnceInjectable);

    return (channel, listener) => rawOnce(channel, (event, ...args) => listener(...args));
  },
  id: "once",
});

export default onceInjectable;
