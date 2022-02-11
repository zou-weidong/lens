/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "../utils";
import rawOnInjectable from "./raw-on.injectable";

export type On = (channel: string, listener: (...args: any[]) => void) => Disposer;

const onInjectable = getInjectable({
  instantiate: (di): On => {
    const rawOn = di.inject(rawOnInjectable);

    return (channel, listener) => rawOn(channel, (event, ...args) => listener(...args));
  },
  id: "on",
});

export default onInjectable;
