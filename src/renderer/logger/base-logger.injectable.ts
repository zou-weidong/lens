/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { LensLogger } from "../../common/logger";
import { baseLoggerInjectionToken } from "../../common/logger/base-logger.token";

const baseLoggerInjectable = getInjectable({
  instantiate: () => console as LensLogger,
  injectionToken: baseLoggerInjectionToken,
  id: "base-logger",
});

export default baseLoggerInjectable;
