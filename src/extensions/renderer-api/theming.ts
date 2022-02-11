/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { Theme } from "../../renderer/themes/theme";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";
import activeThemeInjectable from "../../renderer/themes/active.injectable";

const activeTheme = asLegacyGlobalForExtensionApi(activeThemeInjectable);

export type { Theme };

export function getActiveTheme(): Theme {
  return activeTheme.value;
}
