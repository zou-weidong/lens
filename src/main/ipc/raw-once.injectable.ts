/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "../../common/utils";
import ipcMainInjectable from "./ipc-main.injectable";
import rawOffInjectable from "./raw-off.injectable";

export type RawOnce = (channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => any) => Disposer;


const rawOnceInjectable = getInjectable({
  instantiate: (di): RawOnce => {
    const ipcMainI = di.inject(ipcMainInjectable);
    const rawOff = di.inject(rawOffInjectable);

    return (channel, listener) => {
      ipcMainI.once(channel, listener);

      return () => rawOff(channel, listener);
    };
  },
  id: "raw-once",
});

export default rawOnceInjectable;
