/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { IPty } from "node-pty";

const shellSessionProcessesInjectable = getInjectable({
  instantiate: () => new Map<string, IPty>(),
  id: "shell-session-processes",
});

export default shellSessionProcessesInjectable;
