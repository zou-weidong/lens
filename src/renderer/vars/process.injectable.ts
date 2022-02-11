/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { LensProcess, lensProcessInjectionToken } from "../../common/vars/process.token";

const lensProcessInjectable = getInjectable({
  instantiate: () => "renderer" as LensProcess,
  injectionToken: lensProcessInjectionToken,
  id: "lens-process-name",
});

export default lensProcessInjectable;
