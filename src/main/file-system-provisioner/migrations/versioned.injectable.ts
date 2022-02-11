/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import fileSystemProvisionerStoreLoggerInjectable from "../../../common/file-system-provisioner/logger.injectable";
import { joinMigrations } from "../../utils";

const versionedMigrationsInjectable = getInjectable({
  instantiate: (di) => joinMigrations(
    di.inject(fileSystemProvisionerStoreLoggerInjectable),
    [],
  ),
  id: "file-system-provisioner-store-versioned-migrations",
});

export default versionedMigrationsInjectable ;
