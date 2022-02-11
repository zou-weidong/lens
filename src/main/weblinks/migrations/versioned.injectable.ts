/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { joinMigrations } from "../../utils";
import { getInjectable } from "@ogre-tools/injectable";
import v514Migration from "./5.1.4";
import weblinkStoreLoggerInjectable from "../../../common/weblinks/logger.injectable";

const versionedMigrationsInjectable = getInjectable({
  instantiate: (di) => joinMigrations(
    di.inject(weblinkStoreLoggerInjectable),
    [
      v514Migration,
    ],
  ),
  id: "weblink-store-versioned-migrations",
});

export default versionedMigrationsInjectable;

