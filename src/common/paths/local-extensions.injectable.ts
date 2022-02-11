/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { homedir } from "os";
import path from "path";

const localExtensionsDirectoryInjectable = getInjectable({
  instantiate: () => path.join(homedir(), ".k8slens", "extensions"),
  id: "local-extensions-directory",
});

export default localExtensionsDirectoryInjectable;
