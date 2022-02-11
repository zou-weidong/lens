/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { IpcPrefix, IpcRegistrar } from "../ipc-registrar";
import { Disposers } from "../../lens-extension";
import type { LensMainExtension } from "../../lens-main-extension";
import type { Disposer } from "../../../common/utils";
import { once } from "lodash";
import { asLegacyGlobalForExtensionApi } from "../../di-legacy-globals/for-extension-api";
import extensionIpcMainLoggerInjectable from "./logger.injectable";
import ipcMainInjectable from "../../../main/ipc/ipc-main.injectable";

const logger = asLegacyGlobalForExtensionApi(extensionIpcMainLoggerInjectable);
const ipcMain = asLegacyGlobalForExtensionApi(ipcMainInjectable);

export abstract class IpcMain extends IpcRegistrar {
  constructor(extension: LensMainExtension) {
    super(extension);

    // Call the static method on the bottom child class.
    extension[Disposers].push(() => (this.constructor as typeof IpcMain).resetInstance());
  }

  /**
   * Listen for broadcasts within your extension
   * @param channel The channel to listen for broadcasts on
   * @param listener The function that will be called with the arguments of the broadcast
   * @returns An optional disposer, Lens will cleanup when the extension is disabled or uninstalled even if this is not called
   */
  listen(channel: string, listener: (event: Electron.IpcRendererEvent, ...args: any[]) => any): Disposer {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;
    const cleanup = once(() => {
      logger.info(`removing extension listener`, { channel, extension: { name: this.extension.name, version: this.extension.version }});

      return ipcMain.removeListener(prefixedChannel, listener);
    });

    logger.info(`adding extension listener`, { channel, extension: { name: this.extension.name, version: this.extension.version }});
    ipcMain.addListener(prefixedChannel, listener);
    this.extension[Disposers].push(cleanup);

    return cleanup;
  }

  /**
   * Declare a RPC over `channel`. Lens will cleanup when the extension is disabled or uninstalled
   * @param channel The name of the RPC
   * @param handler The remote procedure that is called
   */
  handle(channel: string, handler: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => any): void {
    const prefixedChannel = `extensions@${this[IpcPrefix]}:${channel}`;

    logger.info(`adding extension handler`, { channel, extension: { name: this.extension.name, version: this.extension.version }});
    ipcMain.handle(prefixedChannel, handler);
    this.extension[Disposers].push(() => {
      logger.info(`removing extension handler`, { channel, extension: { name: this.extension.name, version: this.extension.version }});

      return ipcMain.removeHandler(prefixedChannel);
    });
  }
}
