/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isTestEnvInjectable = getInjectable({
  instantiate: () => !!process.env.JEST_WORKER_ID,
  id: "is-test-env",
});

export default isTestEnvInjectable;
