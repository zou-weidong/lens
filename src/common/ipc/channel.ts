/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForInstantiate, DiContainerForSetup, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";
import sendToViewInjectable from "../../main/ipc/send-to-view.injectable";
import { IpcOneWayStream } from "./steam";

export type ChannelCallable<T> = T extends Channel<infer Args, infer R> ? (...args: Args) => R : never;

export interface Listenable {
  on: (channel: string, listener: (...args: any[]) => void) => void;
}

export class Channel<Args extends any[], R> {
  readonly token: InjectionToken<(...args: Args) => R, void>;

  constructor(readonly channel: string) {
    this.token = getInjectionToken({ id: channel });
  }

  getInjectable(kindOfImpl: string, init: (di: DiContainerForSetup, channel: string) => Promise<(...args: Args) => R>, allowLocal = true) {
    let handler: (...args: Args) => R;

    return getInjectable({
      id: `${this.channel}-${kindOfImpl}-handler`,
      setup: async (di) => {
        handler = await init(di, this.channel);
      },
      instantiate: () => allowLocal ? handler : undefined,
      injectionToken: this.token,
    });
  }

  setupListener(emitter: Listenable, listener: (...args: Args) => void) {
    emitter.on(this.channel, listener);
  }

  getSendToView(di: DiContainerForInstantiate): (args: Args, frameId?: number) => void {
    const sendToView = di.inject(sendToViewInjectable);

    return (args, frameId) => {
      sendToView(this.channel, args, frameId);
    };
  }
}

export function getChannelInjectionToken<Fn extends (...args: any[]) => Promise<any>>(channel: string): Channel<Parameters<Fn>, ReturnType<Fn>> {
  return new Channel(channel);
}

export function getChannelEmitterInjectionToken<Fn extends (...args: any[]) => void>(channel: string): Channel<Parameters<Fn>, ReturnType<Fn>> {
  return new Channel(channel);
}

export function getStreamInjectionToken<T>(channel: string): IpcOneWayStream<T> {
  return new IpcOneWayStream(channel);
}
