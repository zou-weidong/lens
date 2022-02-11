/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../logger/child-logger.injectable";

const errorReportingLoggerInjectable = getInjectable({
  id: "error-reporting-logger",
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "ERROR-REPORTING",
  }),
});

export default errorReportingLoggerInjectable;
