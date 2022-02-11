/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { SemVer } from "semver";
import packageJson from "../../../package.json";

const appVersionInjectable = getInjectable({
  instantiate: () => new SemVer(packageJson.version),
  id: "app-version",
});

export default appVersionInjectable;
