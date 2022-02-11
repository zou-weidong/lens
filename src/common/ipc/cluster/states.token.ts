/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId, ClusterState } from "../../clusters/cluster-types";
import { getChannelInjectionToken } from "../channel";

export type ClusterStates = () => Promise<[ClusterId, ClusterState][]>;

export const clusterStatesInjectionToken = getChannelInjectionToken<ClusterStates>("cluster:states");
