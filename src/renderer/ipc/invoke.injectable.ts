/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { toJS } from "../utils";
import ipcRendererInjectable from "./ipc-renderer.injectable";

const invokeInjectable = getInjectable({
  instantiate: (di) => {
    const ipcRenderer = di.inject(ipcRendererInjectable);

    return (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args.map(toJS));
  },
  id: "invoke",
});

export default invokeInjectable;
