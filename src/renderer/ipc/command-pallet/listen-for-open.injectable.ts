/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IpcRenderer } from "electron";
import type { OpenCommandPalletChannel } from "../../../common/ipc/command-pallet/open-channel.injectable";
import openCommandPalletChannelInjectable from "../../../common/ipc/command-pallet/open-channel.injectable";
import type { Disposer } from "../../utils";
import ipcRendererInjectable from "../ipc-renderer.injectable";

export type ListenForOpen = (clusterId: string | undefined, handler: () => void) => Disposer;

interface Dependencies {
  ipcRenderer: IpcRenderer;
  openCommandPalletChannel: OpenCommandPalletChannel;
}

const listenForOpen = ({ ipcRenderer, openCommandPalletChannel }: Dependencies): ListenForOpen => (
  (clusterId, handler) => {
    const channel = openCommandPalletChannel(clusterId);

    ipcRenderer.on(channel, handler);

    return () => ipcRenderer.off(channel, handler);
  }
);

const listenForOpenInjectable = getInjectable({
  instantiate: (di) => listenForOpen({
    ipcRenderer: di.inject(ipcRendererInjectable),
    openCommandPalletChannel: di.inject(openCommandPalletChannelInjectable),
  }),
  id: "listen-for-open",
});

export default listenForOpenInjectable;
