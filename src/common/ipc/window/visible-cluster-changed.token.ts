/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../clusters/cluster-types";
import { getChannelEmitterInjectionToken } from "../channel";

export type VisibleClusterChanged = (clusterId: ClusterId) => void;

export const emitVisibleClusterChangedInjectionToken = getChannelEmitterInjectionToken<VisibleClusterChanged>("window:visible-cluster-changed");
