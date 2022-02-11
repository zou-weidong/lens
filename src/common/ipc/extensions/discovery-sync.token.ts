/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ExtensionDiscoverySyncMessage } from "../../extensions/sync-types";
import { getStreamInjectionToken } from "../channel";

export const requestExtensionDiscoverySyncStreamInjectionToken = getStreamInjectionToken<ExtensionDiscoverySyncMessage>("extensions:discovery:sync");
