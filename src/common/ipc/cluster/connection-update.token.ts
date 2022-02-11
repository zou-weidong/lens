/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId, KubeAuthUpdate } from "../../clusters/cluster-types";
import { getChannelEmitterInjectionToken } from "../channel";

export type ConnectionUpdate = (clusterId: ClusterId, update: KubeAuthUpdate) => void;

export const emitConnectionUpdateInjectionToken = getChannelEmitterInjectionToken<ConnectionUpdate>("cluster:connection-update");
