/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { DiContainer } from "@ogre-tools/injectable";
import type { IpcMain, IpcRenderer } from "electron";
import EventEmitter from "events";
import type TypedEventEmitter from "typed-emitter";
import broadcastMessageInjectableMain from "../main/ipc/broadcast/message.injectable";
import ipcMainInjectable from "../main/ipc/ipc-main.injectable";
import broadcastMessageInjectableRenderer from "../renderer/ipc/broadcast/message.injectable";
import ipcRendererInjectable from "../renderer/ipc/ipc-renderer.injectable";

interface OverrideIpcBridgeParams {
  rendererDi: DiContainer;
  mainDi: DiContainer;
}

type IpcMainListener = (event: Electron.IpcMainEvent, ...args: any[]) => void;
type IpcMainHandler = (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>;
type IpcRendererListener = (event: Electron.IpcRendererEvent, ...args: any[]) => void;

export function overrideIpc({ rendererDi, mainDi }: OverrideIpcBridgeParams) {
  const mockIpcMain = new EventEmitter() as TypedEventEmitter<Record<string, IpcMainListener>>;
  const mockIpcRenderer = new EventEmitter() as TypedEventEmitter<Record<string, IpcRendererListener>>;
  const invokeBridge = new Map<string, IpcMainHandler>();

  const mockBroadcastMessage = (channel: string, ...args: any[]) => {
    for (const listerner of mockIpcMain.listeners(channel) as IpcMainListener[]) {
      listerner(
        {
          processId: 10,
          frameId: 1,
          sender: undefined,
          senderFrame: undefined,
        } as Electron.IpcMainEvent,
        ...args,
      );
    }

    for (const listener of mockIpcRenderer.listeners(channel) as IpcRendererListener[]) {
      listener(
        {
          ports: [],
          sender: undefined,
          senderId: 0,
        } as Electron.IpcRendererEvent,
        ...args,
      );
    }
  };

  const handleMainMock: Pick<IpcMain, "handle" | "handleOnce" | "removeHandler"> = {
    handle: (channel, listener) => {
      invokeBridge.set(channel, listener);
    },
    handleOnce: (channel, listener) => {
      invokeBridge.set(channel, async (...args) => {
        try {
          return await listener(...args);
        } finally {
          invokeBridge.delete(channel);
        }
      });
    },
    removeHandler: (channel) => {
      invokeBridge.delete(channel);
    },
  };

  mainDi.override(ipcMainInjectable, () => Object.assign(mockIpcMain, handleMainMock));
  mainDi.override(broadcastMessageInjectableMain, () => mockBroadcastMessage);

  const invokeMainMock: Pick<IpcRenderer, "invoke" | "send" | "postMessage" | "sendSync" | "sendTo" | "sendToHost"> = {
    invoke: (channel, ...args) => {
      const handler = invokeBridge.get(channel);

      if (!handler) {
        throw new Error(`No handler for channel ${channel} has been registered`);
      }

      return handler(
        {
          processId: 10,
          frameId: 1,
          sender: undefined,
          senderFrame: undefined,
        } as Electron.IpcMainInvokeEvent,
        ...args,
      );
    },
    send: (channel, ...args) => {
      for (const listerner of mockIpcMain.listeners(channel) as IpcMainListener[]) {
        listerner(
        {
          processId: 10,
          frameId: 1,
          sender: undefined,
          senderFrame: undefined,
        } as Electron.IpcMainEvent,
        ...args,
        );
      }
    },
    postMessage: () => {
      throw new Error("postMessage is not supported");
    },
    sendSync: () => {
      throw new Error("sendSync is not supported");
    },
    sendTo: () => {
      throw new Error("sendTo is not supported");
    },
    sendToHost: () => {
      throw new Error("sendToHost is not supported");
    },
  };

  rendererDi.override(ipcRendererInjectable, () => Object.assign(mockIpcRenderer, invokeMainMock));
  rendererDi.override(broadcastMessageInjectableRenderer, () => mockBroadcastMessage);
}
