/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import path from "path";
import isDevelopmentInjectable from "../../common/vars/is-development.injectable";
import resourcesPathInjectable from "../../common/vars/resources-path.injectable";

const trayIconTemplatePathInjectable = getInjectable({
  id: "tray-icon-template-path",
  instantiate: (di) => {
    const isDevelopment = di.inject(isDevelopmentInjectable);
    const resourcesPath = di.inject(resourcesPathInjectable);

    return path.resolve(
      resourcesPath,
      ...(
        isDevelopment
          ? ["build", "tray"]
          : ["static", "icons"]
      ),
      "trayIconTemplate.png",
    );
  },
});

export default trayIconTemplatePathInjectable;
