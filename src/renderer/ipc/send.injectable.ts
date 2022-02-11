/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { toJS } from "../utils";
import ipcRendererInjectable from "./ipc-renderer.injectable";

export type Send = (channel: string, ...args: any[]) => void;

const sendInjectable = getInjectable({
  instantiate: (di): Send => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channel, ...args) => {
      ipcRenderer.send(channel, ...args.map(toJS));
    };
  },
  id: "send",
});

export default sendInjectable;
