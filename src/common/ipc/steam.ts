/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForSetup, InjectionToken } from "@ogre-tools/injectable";
import { getInjectable, getInjectionToken } from "@ogre-tools/injectable";

export type StreamListener<T> = (val: T) => void;

export interface StreamListeners<T> {
  onData: StreamListener<T>;
  onConnectionError: (err: any) => void;
  onClose: () => void;
}

export interface OneWayStreamChannels {
  data: string;
  close: string;
  ready: string;
}

export type RequestCatalogSyncStreamChannels = () => Promise<OneWayStreamChannels>;

export class IpcOneWayStream<T> {
  readonly token: InjectionToken<(listeners: StreamListeners<T>) => void, void>;

  constructor(protected readonly baseChannel: string) {
    this.token = getInjectionToken({ id: baseChannel });
  }

  getRendererInjectable(init: (di: DiContainerForSetup, baseChannel: string) => Promise<(listeners: StreamListeners<T>) => void>) {
    let handler: (listener: StreamListeners<T>) => void;

    return getInjectable({
      id: `${this.baseChannel}-handler`,
      setup: async (di) => {
        handler = await init(di, this.baseChannel);
      },
      instantiate: () => handler,
      injectionToken: this.token,
    });
  }

  getMainInjectable(init: (di: DiContainerForSetup, baseChannel: string) => void) {
    return getInjectable({
      id: `${this.baseChannel}-handler`,
      setup: (di) => {
        init(di, this.baseChannel);
      },
      instantiate: () => (listeners): void => {
        void listeners;
        throw new Error(`Cannot start a one way channel for ${this.baseChannel} on main`);
      },
      injectionToken: this.token,
    });
  }
}
