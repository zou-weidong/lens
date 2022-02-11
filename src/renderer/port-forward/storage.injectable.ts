/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ForwardedPort } from "./item";
import createStorageInjectable, { type StorageLayer } from "../utils/storage/create.injectable";

let storage: StorageLayer<ForwardedPort[] | undefined>;

const portForwardStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage("port_forwards", undefined);
  },
  instantiate: () => storage,
  id: "port-forward-storage",
});

export default portForwardStorageInjectable;
