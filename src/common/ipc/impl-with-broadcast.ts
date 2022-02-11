/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Injectable } from "@ogre-tools/injectable";
import { toJS } from "mobx";
import { broadcastMessageInjectionToken } from "./broadcast/message.token";
import type { Channel, ChannelCallable } from "./channel";

export function implWithBroadcast<Token extends Channel<any[], void>>(channelToken: Token) {
  return channelToken.getInjectable("broadcast", async (di, channel) => {
    const broadcastMessage = await di.inject(broadcastMessageInjectionToken.token);

    return (...args: any[]) => broadcastMessage(channel, ...args.map(toJS));
  }) as Injectable<ChannelCallable<Token>, ChannelCallable<Token>, void>;
}
