/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { ClusterId } from "../../../clusters/cluster-types";
import { getChannelEmitterInjectionToken } from "../../channel";

export type ListNamespacesForbidden = (clusterId: ClusterId) => void;

export const emitListNamespacesForbiddenInjectionToken = getChannelEmitterInjectionToken<ListNamespacesForbidden>("cluster:list-namespaces-forbidden");
