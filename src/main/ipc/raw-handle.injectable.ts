/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcMainInjectable from "./ipc-main.injectable";

export type RawHandle = (channel: string, listener: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any) => void;

const rawHandleInjectable = getInjectable({
  instantiate: (di): RawHandle => {
    const ipcMain = di.inject(ipcMainInjectable);

    return (channel, listener) => ipcMain.handle(channel, listener);
  },
  id: "raw-handle",
});

export default rawHandleInjectable;
