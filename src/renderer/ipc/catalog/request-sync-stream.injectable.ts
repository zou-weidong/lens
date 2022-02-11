/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { requestCatalogSyncStreamInjectionToken } from "../../../common/ipc/catalog/sync.token";
import { implOneWayStream } from "../impl-stream";

const requestCatalogSyncStreamInjectable = implOneWayStream(requestCatalogSyncStreamInjectionToken);

export default requestCatalogSyncStreamInjectable;
