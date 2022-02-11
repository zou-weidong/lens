/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import emitNetworkOfflineInjectable from "../../common/ipc/network/offline/emit.injectable";
import type { NetworkOffline } from "../../common/ipc/network/offline/emit.token";
import emitNetworkOnlineInjectable from "../../common/ipc/network/online/emit.injectable";
import type { NetworkOnline } from "../../common/ipc/network/online/emit.token";

interface Dependencies {
  emitNetworkOnline: NetworkOnline;
  emitNetworkOffline: NetworkOffline;
}

const initNetworkEmitters = ({ emitNetworkOnline, emitNetworkOffline }: Dependencies) => (
  () => {
    window.addEventListener("offline", emitNetworkOnline);
    window.addEventListener("online", emitNetworkOffline);
  }
);

const initNetworkEmittersInjectable = getInjectable({
  instantiate: (di) => initNetworkEmitters({
    emitNetworkOnline: di.inject(emitNetworkOnlineInjectable),
    emitNetworkOffline: di.inject(emitNetworkOfflineInjectable),
  }),
  id: "init-network-emitters",
});

export default initNetworkEmittersInjectable;
