/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import electronAppInjectable from "./app.injectable";

const electronAppVersionInjectable = getInjectable({
  instantiate: (di) => di.inject(electronAppInjectable).getVersion(),
  id: "electron-app-version",
});

export default electronAppVersionInjectable;
