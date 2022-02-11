/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { NativeTheme } from "electron";
import type TypedEventEmitter from "typed-emitter";
import { EventEmitter } from "ws";
import { osNativeThemeInjectionToken } from "../../../common/ipc/themes/os-native.token";
import type { OsNativeTheme } from "../../../renderer/themes/os-native/theme.injectable";
import nativeThemeInjectable from "../../electron/native-theme.injectable";
import { disposer } from "../../utils";
import type { StreamSource } from "../impl-stream";
import { implOneWayStream } from "../impl-stream";

const osNativeThemeInjectable = implOneWayStream(osNativeThemeInjectionToken, async (di) => {
  const nativeTheme = await di.inject(nativeThemeInjectable);

  return () => {
    const emitter: TypedEventEmitter<StreamSource<OsNativeTheme>> = new EventEmitter();
    const onClose = disposer();

    const onReady = () => {
      const onUpdated = () => {
        emitter.emit("data", computeOsNativeThemeFor(nativeTheme));
      };

      onUpdated();
      nativeTheme.on("updated", onUpdated);
      onClose.push(() => nativeTheme.off("updated", onUpdated));
    };

    emitter.once("ready", onReady);
    onClose.push(() => emitter.off("ready", onReady));

    emitter.once("close", onClose);

    return emitter;
  };
});

export default osNativeThemeInjectable;

const computeOsNativeThemeFor = (nativeTheme: NativeTheme): OsNativeTheme => ({
  type: nativeTheme.shouldUseDarkColors ? "dark" : "light",
});
