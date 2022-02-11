/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { SubscribeStores } from "./kube-watch-api";
import kubeWatchApiInjectable from "./kube-watch-api.injectable";

const subscribeStoresInjectable = getInjectable({
  id: "subscribe-stores",
  instantiate: (di): SubscribeStores => {
    const watchApi = di.inject(kubeWatchApiInjectable);

    return (stores, opts) => watchApi.subscribeStores(stores, opts);
  },
});

export default subscribeStoresInjectable;
