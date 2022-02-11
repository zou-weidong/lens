/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import osNativeThemeStreamInjectable from "../../ipc/themes/os-native.injectable";
import themesLoggerInjectable from "../logger.injectable";
import osNativeThemeInjectable from "./theme.injectable";

const osNativeThemeListenerInjectable = getInjectable({
  id: "os-native-theme-listener",
  setup: async (di) => {
    const osNativeThemeStream = await di.inject(osNativeThemeStreamInjectable);
    const osNativeTheme = await di.inject(osNativeThemeInjectable);
    const logger = await di.inject(themesLoggerInjectable);

    osNativeThemeStream({
      onClose: () => logger.info("OS native theme sync stream has closed"),
      onConnectionError: (error) => logger.error("Failed to start OS native theme sync stream", { error }),
      onData: (value) => osNativeTheme.type = value.type,
    });
  },
  instantiate: () => undefined,
});

export default osNativeThemeListenerInjectable;
