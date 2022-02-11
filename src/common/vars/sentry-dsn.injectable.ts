/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import packageJson from "../../../package.json";

const sentryDsnInjectable = getInjectable({
  instantiate: () => packageJson.config.sentryDsn,
  id: "sentry-dsn",
});

export default sentryDsnInjectable;
