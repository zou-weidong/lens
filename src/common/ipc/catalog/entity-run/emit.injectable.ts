/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { implWithBroadcast } from "../../impl-with-broadcast";
import { emitCatalogEntityRunInjectionToken } from "./emit.token";

// TODO: remove once we no longer have IFRAMEs
const emitCatalogEntityRunInjectable = implWithBroadcast(emitCatalogEntityRunInjectionToken);

export default emitCatalogEntityRunInjectable;
