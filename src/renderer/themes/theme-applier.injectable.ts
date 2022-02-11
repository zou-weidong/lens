/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { reaction } from "mobx";
import activeThemeInjectable from "./active.injectable";
import themesLoggerInjectable from "./logger.injectable";

const activeThemeApplierInjectable = getInjectable({
  setup: async (di) => {
    const activeTheme = await di.inject(activeThemeInjectable);
    const logger = await di.inject(themesLoggerInjectable);

    reaction(
      () => activeTheme.value,
      ({ colors, type }) => {
        try {
          for (const [name, value] of Object.entries(colors)) {
            document.documentElement.style.setProperty(`--${name}`, value);
          }

          // Adding universal theme flag which can be used in component styles
          document.body.classList.toggle("theme-light", type === "light");
        } catch (error) {
          logger.error(`Failed to apply theme change`, error);
          activeTheme.reset();
        }
      },
      {
        fireImmediately: true,
      },
    );
  },
  instantiate: () => undefined,
  id: "active-theme-applier",
});

export default activeThemeApplierInjectable;
