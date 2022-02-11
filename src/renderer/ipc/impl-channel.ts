/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { Channel, ChannelCallable } from "../../common/ipc/channel";
import invokeInjectable from "./invoke.injectable";
import type { DiContainerForSetup, Injectable } from "@ogre-tools/injectable";
import sendInjectable from "./send.injectable";
import onInjectable from "./on.injectable";

export function implWithInvoke<Token extends Channel<any[], any>>(channelToken: Token) {
  return channelToken.getInjectable("invoke", async (di, channel) => {
    const invoke = await di.inject(invokeInjectable);

    return (...args: any[]) => invoke(channel, ...args);
  }) as Injectable<ChannelCallable<Token>, ChannelCallable<Token>, void>;
}

export type ChannelInit<Args extends any[], R = void> = (di: DiContainerForSetup) => Promise<(...args: Args) => R>;

export function implWithOn<Args extends any[]>(channelToken: Channel<Args, void>, init: ChannelInit<Args>, allowLocal?: boolean) {
  return channelToken.getInjectable("on", async (di, channel) => {
    const on = await di.inject(onInjectable);
    const listener = await init(di);

    on(channel, listener);

    return listener;
  }, allowLocal);
}

export function implWithSend<Token extends Channel<any[], void>>(channelToken: Token) {
  return channelToken.getInjectable("send", async (di, channel) => {
    const send = await di.inject(sendInjectable);

    return (...args: any[]) => send(channel, ...args);
  }) as Injectable<ChannelCallable<Token>, ChannelCallable<Token>, void>;
}
