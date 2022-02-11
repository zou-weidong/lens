/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import directoryForExtensionDataInjectable from "../paths/extension-data.injectable";
import type { BaseStoreParams } from "../base-store";
import fileSystemProvisionerStoreLoggerInjectable from "./logger.injectable";
import { FileSystemProvisionerModel, FileSystemProvisionerStore } from "./store";
import directoryForUserDataInjectable from "../paths/user-data.injectable";

const createFileSystemProvisionerStoreInjectable = getInjectable({
  instantiate: (di, params: BaseStoreParams<FileSystemProvisionerModel>) => (
    new FileSystemProvisionerStore({
      directoryForExtensionData: di.inject(directoryForExtensionDataInjectable),
      logger: di.inject(fileSystemProvisionerStoreLoggerInjectable),
      userDataPath: di.inject(directoryForUserDataInjectable),
    }, params)
  ),
  lifecycle: lifecycleEnum.transient,
  id: "create-file-system-provisioner-store",
});

export default createFileSystemProvisionerStoreInjectable;
