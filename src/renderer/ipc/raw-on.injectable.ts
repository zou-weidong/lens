/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { Disposer } from "../utils";
import ipcRendererInjectable from "./ipc-renderer.injectable";
import rawOffInjectable from "./raw-off.injectable";

export type RawOn = (channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => any) => Disposer;

const rawOnInjectable = getInjectable({
  instantiate: (di): RawOn => {
    const ipcRenderer = di.inject(ipcRendererInjectable);
    const rawOff = di.inject(rawOffInjectable);

    return (channel, listener) => {
      ipcRenderer.on(channel, listener);

      return () => rawOff(channel, listener);
    };
  },
  id: "raw-on",
});

export default rawOnInjectable;
