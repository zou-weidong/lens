/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Hotbar store migrations

import { joinMigrations } from "../../utils";
import { getInjectable } from "@ogre-tools/injectable";
import v500Alpha0MigrationInjectable from "./5.0.0-alpha.0.injectable";
import version500alpha2 from "./5.0.0-alpha.2";
import v500Beta5MigrationInjectable from "./5.0.0-beta.5.injectable";
import v500Beta10MigrationInjectable from "./5.0.0-beta.10.injectable";
import hotbarStoreLoggerInjectable from "../../../common/hotbars/logger.injectable";

const versionedMigrationsInjectable = getInjectable({
  instantiate: (di) => joinMigrations(
    di.inject(hotbarStoreLoggerInjectable),
    [
      di.inject(v500Alpha0MigrationInjectable),
      version500alpha2,
      di.inject(v500Beta5MigrationInjectable),
      di.inject(v500Beta10MigrationInjectable),
    ],
  ),
  id: "hotbar-store-versioned-migrations",
});

export default versionedMigrationsInjectable;

