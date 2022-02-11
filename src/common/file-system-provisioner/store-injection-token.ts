/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getInjectionToken } from "@ogre-tools/injectable";
import type { FileSystemProvisionerStore } from "./store";

export const fileSystemProvisionerStoreInjectionToken = getInjectionToken<FileSystemProvisionerStore>({
  id: "file-system-provisioner-store-token",
});
