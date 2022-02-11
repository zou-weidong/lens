/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import getClusterByIdInjectable from "../../../common/clusters/get-by-id.injectable";
import { refreshClusterInjectionToken } from "../../../common/ipc/cluster/refresh.token";
import { implWithHandle } from "../impl-channel";

const refreshClusterInjectable = implWithHandle(refreshClusterInjectionToken, async (di) => {
  const getClusterById = await di.inject(getClusterByIdInjectable);

  return (id) => getClusterById(id)?.refresh({ refreshMetadata: true });
});

export default refreshClusterInjectable;
