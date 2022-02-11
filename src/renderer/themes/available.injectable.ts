/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { observable } from "mobx";
import lensDarkTheme from "./lens-dark";
import lensLightTheme from "./lens-light";
import type { ThemeId, Theme } from "./theme";

const availableThemesInjectable = getInjectable({
  instantiate: () => observable.map<ThemeId, Theme>({
    "lens-dark": lensDarkTheme,
    "lens-light": lensLightTheme,
  }),
  id: "available-themes",
});

export default availableThemesInjectable;
