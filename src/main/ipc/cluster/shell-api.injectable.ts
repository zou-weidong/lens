/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { requestClusterShellApiInjectionToken } from "../../../common/ipc/cluster/shell-api.token";
import shellRequestAuthenticatorInjectable from "../../lens-proxy/handlers/shell-api-request/authenticator.injectable";
import { implWithHandle } from "../impl-channel";

const requestClusterShellApiInjectable = implWithHandle(requestClusterShellApiInjectionToken, async (di) => {
  const authenticator = await di.inject(shellRequestAuthenticatorInjectable);

  return (clusterId, tabId) => authenticator.requestToken(clusterId, tabId);
});

export default requestClusterShellApiInjectable;
