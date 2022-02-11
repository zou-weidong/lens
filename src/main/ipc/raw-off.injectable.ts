/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcMainInjectable from "./ipc-main.injectable";

export type RawOff = (channel: string, listener: (event: Electron.IpcMainEvent, ...args: any[]) => void) => void;

const rawOffInjectable = getInjectable({
  instantiate: (di): RawOff => {
    const ipcMain = di.inject(ipcMainInjectable);

    return (channel, listener) => ipcMain.off(channel, listener);
  },
  id: "raw-off",
});

export default rawOffInjectable;
