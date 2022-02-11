/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { requestExtensionDiscoverySyncStreamInjectionToken } from "../../../common/ipc/extensions/discovery-sync.token";
import { implOneWayStream } from "../impl-stream";

const requestExtensionDiscoverySyncStreamInjectable = implOneWayStream(requestExtensionDiscoverySyncStreamInjectionToken);

export default requestExtensionDiscoverySyncStreamInjectable;
