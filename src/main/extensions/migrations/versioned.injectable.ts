/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import extensionsPreferencesStoreLoggerInjectable from "../../../common/extensions/preferences/logger.injectable";
import { joinMigrations } from "../../utils";

const versionedMigrationsInjectable = getInjectable({
  instantiate: (di) => joinMigrations(
    di.inject(extensionsPreferencesStoreLoggerInjectable),
    [],
  ),
  id: "extensions-preferences-store-versioned-migrations",
});

export default versionedMigrationsInjectable ;
