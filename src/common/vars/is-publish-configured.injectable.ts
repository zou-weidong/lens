/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageJson from "../../../package.json";

const isPublishConfiguredInjectable = getInjectable({
  instantiate: () => Object.keys(packageJson.build).includes("publish"),
  id: "is-publish-configured",
});

export default isPublishConfiguredInjectable;
