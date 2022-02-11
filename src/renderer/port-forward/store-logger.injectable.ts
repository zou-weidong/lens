/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../../common/logger/child-logger.injectable";

const portForwardStoreLoggerInjectable = getInjectable({
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "PORT-FORWARD-STORE",
  }),
  id: "port-forward-store-logger",
});

export default portForwardStoreLoggerInjectable;
