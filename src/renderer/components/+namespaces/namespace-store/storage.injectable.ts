/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import createStorageInjectable, { type StorageLayer } from "../../../utils/storage/create.injectable";

let storage: StorageLayer<string[] | undefined>;

const selectedNamespacesStorageInjectable = getInjectable({
  setup: async (di) => {
    const createStorage = await di.inject(createStorageInjectable);

    storage = createStorage<string[] | undefined>(
      "selected_namespaces",
      undefined,
    );
  },
  instantiate: () => storage,
  id: "selected-namespaces-storage",
});

export default selectedNamespacesStorageInjectable;
