/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { OsNativeTheme } from "../../../renderer/themes/os-native/theme.injectable";
import { getStreamInjectionToken } from "../channel";

export const osNativeThemeInjectionToken = getStreamInjectionToken<OsNativeTheme>("os-native-theme-token");
