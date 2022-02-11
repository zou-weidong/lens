/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import ipcRendererInjectable from "./ipc-renderer.injectable";

export type RawOff = (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => void;

const rawOffInjectable = getInjectable({
  instantiate: (di): RawOff => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channel, listener) => ipcRenderer.off(channel, listener);
  },
  id: "raw-off",
});

export default rawOffInjectable;
