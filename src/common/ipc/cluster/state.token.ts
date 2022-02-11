/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId, ClusterState } from "../../clusters/cluster-types";
import { getChannelEmitterInjectionToken } from "../channel";

export type UpdateClusterState = (clusterId: ClusterId, state: ClusterState) => void;

export const emitUpdateClusterStateInjectionToken = getChannelEmitterInjectionToken<UpdateClusterState>("cluster:state");
