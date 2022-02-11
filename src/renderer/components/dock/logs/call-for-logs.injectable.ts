/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { QueryForLogs } from "../../../../common/k8s-api/endpoints";
import podApiInjectable from "../../../../common/k8s-api/endpoints/pod.api.injectable";

const queryForLogsInjectable = getInjectable({
  id: "call-for-logs",
  instantiate: (di): QueryForLogs => {
    const api = di.inject(podApiInjectable);

    return (params, query) => api.getLogs(params, query);
  },
});

export default queryForLogsInjectable;
