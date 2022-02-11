/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../clusters/cluster-types";
import { getChannelInjectionToken } from "../channel";

export type ClearClusterDeleting = (clusterId: ClusterId) => Promise<void>;

export const clearClusterDeletingInjectionToken = getChannelInjectionToken<ClearClusterDeleting>("cluster:clear-deleting");
