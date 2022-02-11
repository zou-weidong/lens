/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { DiContainerForSetup, Injectable } from "@ogre-tools/injectable";
import type { IpcMainEvent, IpcMainInvokeEvent } from "electron";
import type { Channel, ChannelCallable } from "../../common/ipc/channel";
import { toJS } from "../../common/utils";
import onInjectable from "./on.injectable";
import rawOnInjectable from "./raw-on.injectable";
import handleInjectable from "./handle.injectable";
import rawHandleInjectable from "./raw-handle.injectable";

/**
 * NOTE: both the raw and the non-raw versions will produce the same
 * `injectable.id` field.
 *
 * This is on purpose so that only one can be used on a given side.
 */

export type ChannelInit<Args extends any[], R = void> = (di: DiContainerForSetup) => Promise<(...args: Args) => R>;

export function implWithOn<Args extends any[]>(channelToken: Channel<Args, void>, init: ChannelInit<Args>) {
  return channelToken.getInjectable("on", async (di, channel) => {
    const on = await di.inject(onInjectable);
    const listener = await init(di);

    on(channel, (...args) => listener(...args.map(toJS) as Args));

    return listener;
  }) as Injectable<ChannelCallable<Channel<Args, void>>, ChannelCallable<Channel<Args, void>>, void>;
}

export function implWithRawOn<Args extends any[]>(channelToken: Channel<Args, void>, init: ChannelInit<[IpcMainEvent, ...Args]>) {
  return channelToken.getInjectable("on", async (di, channel) => {
    const rawOn = await di.inject(rawOnInjectable);
    const listener = await init(di);

    rawOn(channel, (event, ...args) => listener(event, ...args.map(toJS) as Args));

    return () => {
      throw new Error(`Directly calling IPC listener ${channel} on main is invalid`);
    };
  }) as Injectable<ChannelCallable<Channel<Args, void>>, ChannelCallable<Channel<Args, void>>, void>;
}

export function implWithHandle<Args extends any[], R extends Promise<any>>(channelToken: Channel<Args, R>, init: ChannelInit<Args, R>) {
  return channelToken.getInjectable("handle", async (di, channel) => {
    const handle = await di.inject(handleInjectable);
    const listener = await init(di);

    handle(channel, (...args) => listener(...args.map(toJS) as Args));

    return listener;
  }) as Injectable<ChannelCallable<Channel<Args, R>>, ChannelCallable<Channel<Args, R>>, void>;
}

export function implWithRawHandle<Args extends any[], R extends Promise<any>>(channelToken: Channel<Args, R>, init: ChannelInit<[IpcMainInvokeEvent, ...Args], R>) {
  return channelToken.getInjectable("handle", async (di, channel) => {
    const rawHandle = await di.inject(rawHandleInjectable);
    const listener = await init(di);

    rawHandle(channel, (event, ...args) => listener(event, ...args.map(toJS) as Args));

    return () => {
      throw new Error(`Directly calling IPC channel ${channel} on main is invalid`);
    };
  }) as Injectable<ChannelCallable<Channel<Args, R>>, ChannelCallable<Channel<Args, R>>, void>;
}
