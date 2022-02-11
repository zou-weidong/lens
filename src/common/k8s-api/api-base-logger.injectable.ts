/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../logger/child-logger.injectable";

const apiBaseLoggerInjectable = getInjectable({
  id: "api-base-logger",
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "BASE-JSON-API",
  }),
});

export default apiBaseLoggerInjectable;
