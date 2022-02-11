/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const isSnapInjectable = getInjectable({
  instantiate: () => !!process.env.SNAP,
  id: "is-snap",
});

export default isSnapInjectable;
