/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../clusters/cluster-types";
import { getChannelEmitterInjectionToken } from "../channel";

export type SetClusterAsVisible = (clusterId: ClusterId | undefined) => void;

export const setClusterAsVisibleInjectionToken = getChannelEmitterInjectionToken<SetClusterAsVisible>("cluster:set-as-visible");
