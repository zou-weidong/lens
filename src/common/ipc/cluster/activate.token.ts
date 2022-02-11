/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../clusters/cluster-types";
import { getChannelInjectionToken } from "../channel";

export type ActivateCluster = (id: ClusterId, force?: boolean) => Promise<void>;

export const activateClusterInjectionToken = getChannelInjectionToken<ActivateCluster>("cluster:activate");
