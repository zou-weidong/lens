/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelEmitterInjectionToken } from "../../channel";

export type CatalogEntityRun = (entityId: string) => void;

export const emitCatalogEntityRunInjectionToken = getChannelEmitterInjectionToken<CatalogEntityRun>("catalog:entity-run");
