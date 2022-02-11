/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import rawHandleInjectable from "./raw-handle.injectable";

export type Handle = (channel: string, listener: (...args: any[]) => any) => void;

const handleInjectable = getInjectable({
  instantiate: (di): Handle => {
    const rawHandle = di.inject(rawHandleInjectable);

    return (channel, listener) => rawHandle(channel, (event, ...args) => listener(...args));
  },
  id: "handle",
});

export default handleInjectable;
