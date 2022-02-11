/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { Singleton } from "../../common/utils";
import type { LensExtension } from "../lens-extension";
import { createHash } from "crypto";
import { broadcastMessageInjectionToken } from "../../common/ipc/broadcast/message.token";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";

export const IpcPrefix = Symbol();

const broadcastMessage = asLegacyGlobalForExtensionApi(broadcastMessageInjectionToken.token);

export abstract class IpcRegistrar extends Singleton {
  /**
   * @internal
   */
  readonly [IpcPrefix]: string;

  constructor(protected extension: LensExtension) {
    super();
    this[IpcPrefix] = createHash("sha256").update(extension.id).digest("hex");
  }

  /**
   *
   * @param channel The channel to broadcast to your whole extension, both `main` and `renderer`
   * @param args The arguments passed to all listeners
   */
  broadcast(channel: string, ...args: any[]): void {
    broadcastMessage(`extensions@${this[IpcPrefix]}:${channel}`, ...args);
  }
}
