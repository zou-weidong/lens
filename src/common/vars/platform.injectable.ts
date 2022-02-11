/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";

const platformInjectable = getInjectable({
  id: "platform",
  instantiate: () => {
    switch (process.platform) {
      case "linux":
        return "linux";
      case "darwin":
        return "darwin";
      case "win32":
        return "windows";
      default:
        throw new Error(`${process.platform} is an unsupported`);
    }
  },
});

export default platformInjectable;
