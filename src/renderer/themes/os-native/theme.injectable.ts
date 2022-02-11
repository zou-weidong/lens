/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import type { ThemeType } from "../theme";

export interface OsNativeTheme {
  type: ThemeType;
}

const osNativeThemeInjectable = getInjectable({
  id: "os-native-them",
  instantiate: () => observable.object<OsNativeTheme>({
    type: "dark",
  }),
});

export default osNativeThemeInjectable;
