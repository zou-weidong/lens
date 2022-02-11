/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { CatalogSyncMessage } from "../../catalog/entity/sync-types";
import { getStreamInjectionToken } from "../channel";

export const requestCatalogSyncStreamInjectionToken = getStreamInjectionToken<CatalogSyncMessage>("catalog:sync");
