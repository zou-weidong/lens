/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import getMapEntryInjectable, { KubeconfigSyncParsedValue } from "./get-map-entry.injectable";

export type GetAllEntries = (filePaths: string[]) => Promise<[string, KubeconfigSyncParsedValue][]>;

const getAllEntriesInjectable = getInjectable({
  instantiate: (di): GetAllEntries => {
    const getMapEntry = di.inject(getMapEntryInjectable);

    return (filePaths) => Promise.all(filePaths.map(filePath => getMapEntry({ filePath })));
  },
  id: "get-all-entries",
});

export default getAllEntriesInjectable;
