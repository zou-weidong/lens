/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { osNativeThemeInjectionToken } from "../../../common/ipc/themes/os-native.token";
import { implOneWayStream } from "../impl-stream";

const osNativeThemeStreamInjectable = implOneWayStream(osNativeThemeInjectionToken);

export default osNativeThemeStreamInjectable;
