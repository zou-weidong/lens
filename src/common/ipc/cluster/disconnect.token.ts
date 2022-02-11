/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../clusters/cluster-types";
import { getChannelInjectionToken } from "../channel";

export type DisconnectCluster = (id: ClusterId) => Promise<void>;

export const disconnectClusterInjectionToken = getChannelInjectionToken<DisconnectCluster>("cluster:disconnect");
