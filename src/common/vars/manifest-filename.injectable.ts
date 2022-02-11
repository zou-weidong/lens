/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const manifestFilenameInjectable = getInjectable({
  instantiate: () => "package.json",
  id: "manifest-filename",
});

export default manifestFilenameInjectable;
