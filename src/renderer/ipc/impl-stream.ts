/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { IpcOneWayStream, OneWayStreamChannels } from "../../common/ipc/steam";
import invokeMainInjectable from "./invoke.injectable";
import onInjectable from "./on.injectable";
import onceInjectable from "./once.injectable";
import sendInjectable from "./send.injectable";

export function implOneWayStream<T>(token: IpcOneWayStream<T>) {
  return token.getRendererInjectable(async (di, connectChannel) => {
    const on = await di.inject(onInjectable);
    const once = await di.inject(onceInjectable);
    const send = await di.inject(sendInjectable);
    const invoke = await di.inject(invokeMainInjectable);
    const requestChannels = (): Promise<OneWayStreamChannels> => invoke(connectChannel);

    return (listeners) => {
      (async () => {
        try {
          const { data, close, ready } = await requestChannels();

          const removeOnData = on(data, (data: T) => listeners.onData(data));

          once(close, () => {
            removeOnData();
            listeners.onClose();
          });

          send(ready);
        } catch (error) {
          listeners.onConnectionError(error);
        }
      })();
    };
  });
}
