/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import childLoggerInjectable from "../../logger/child-logger.injectable";

const catalogEntityRegistryLoggerInjectable = getInjectable({
  instantiate: (di) => di.inject(childLoggerInjectable, {
    prefix: "CATALOG-ENTITY-REGISTRY",
  }),
  id: "catalog-entity-registry-logger",
});

export default catalogEntityRegistryLoggerInjectable;
