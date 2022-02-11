/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { getChannelInjectionToken } from "../channel";

export type SetClusterDeleting = (clusterId: string) => Promise<void>;

export const setClusterDeletingInjectionToken = getChannelInjectionToken<SetClusterDeleting>("cluster:set-deleting");
