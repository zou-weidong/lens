/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import availableThemesInjectable from "../../themes/available.injectable";
import type { SelectOption } from "../select";

const themeOptionsInjectable = getInjectable({
  instantiate: (di) => {
    const availableThemes = di.inject(availableThemesInjectable);

    return computed(() => Array.from(
      availableThemes,
      ([themeId, theme]) => ({
        label: theme.name,
        value: themeId,
      } as SelectOption<string>),
    ));
  },
  id: "theme-options",
});

export default themeOptionsInjectable;
