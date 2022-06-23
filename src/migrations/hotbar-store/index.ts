/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Hotbar store migrations

import { joinMigrations } from "../helpers";

import version500alpha0 from "./5.0.0-alpha.0";
import version500alpha2 from "./5.0.0-alpha.2";
import version500beta5 from "./5.0.0-beta.5";
import version500beta10 from "./5.0.0-beta.10";
import version560alpha5 from "./5.6.0-alpha.5";

export default joinMigrations(
  version500alpha0,
  version500alpha2,
  version500beta5,
  version500beta10,
  version560alpha5,
);
