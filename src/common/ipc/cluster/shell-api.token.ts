/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../clusters/cluster-types";
import { getChannelInjectionToken } from "../channel";

export type ClusterShellApi = (clusterId: ClusterId, tabId: string) => Promise<Uint8Array>;

export const requestClusterShellApiInjectionToken = getChannelInjectionToken<ClusterShellApi>("cluster:shell-api");
