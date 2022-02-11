/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RequireExactlyOne } from "type-fest";
import type { ClusterId } from "../../clusters/cluster-types";
import { getChannelInjectionToken } from "../channel";

export type KubectlDeleteAll = (clusterId: ClusterId, resources: string[], extraArgs: string[]) => Promise<RequireExactlyOne<{ stdout: string; stderr: string }>>;

export const kubectlDeleteAllInjectionToken = getChannelInjectionToken<KubectlDeleteAll>("kubectl:delete-all");
