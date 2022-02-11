/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../logger/child-logger.injectable";

const fileSystemProvisionerStoreLoggerInjectable = getInjectable({
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "FILE-SYSTEM-PROVISIONER-STORE",
  }),
  id: "file-system-provisioner-store-logger",
});

export default fileSystemProvisionerStoreLoggerInjectable;
