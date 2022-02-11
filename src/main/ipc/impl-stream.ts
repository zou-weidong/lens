/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForSetup } from "@ogre-tools/injectable";
import type TypedEventEmitter from "typed-emitter";
import type { IpcOneWayStream, OneWayStreamChannels } from "../../common/ipc/steam";
import { disposer } from "../../common/utils";
import broadcastMessageInjectable from "./broadcast/message.injectable";
import * as uuid from "uuid";
import handleInjectable from "./handle.injectable";
import onInjectable from "./on.injectable";
import onceInjectable from "./once.injectable";

export interface StreamSource<T> {
  data: (data: T) => void;
  close: () => void;

  /**
   * NOTE: this event should be listened on by the source
   */
  ready: () => void;
}

export function implOneWayStream<T>(token: IpcOneWayStream<T>, init: (di: DiContainerForSetup) => Promise<() => TypedEventEmitter<StreamSource<T>>>) {
  return token.getMainInjectable(async (di, baseChannel) => {
    const broadcast = await di.inject(broadcastMessageInjectable);
    const handle = await di.inject(handleInjectable);
    const on = await di.inject(onInjectable);
    const once = await di.inject(onceInjectable);
    const handler = await init(di);

    handle(baseChannel, () => {
      const channels: OneWayStreamChannels = {
        close: `${baseChannel}:close:${uuid.v4()}`,
        data: `${baseChannel}:data:${uuid.v4()}`,
        ready: `${baseChannel}:ready:${uuid.v4()}`,
      };
      const emitter = handler();
      const onData = (data: T) => broadcast(channels.data, data);
      const onClose = disposer();

      emitter.on("data", onData);
      onClose.push(() => emitter.off("data", onData));

      onClose.push(on(channels.ready, () => emitter.emit("ready")));

      // Set up back channel for the other side closing the stream
      onClose.push(once(channels.close, onClose));

      // Set up closing the stream from this side
      const onEmitterClose = () => {
        onClose();
        broadcast(channels.close);
      };

      emitter.once("close", onEmitterClose);
      onClose.push(() => emitter.off("close", onEmitterClose));

      return channels;
    });
  });
}
