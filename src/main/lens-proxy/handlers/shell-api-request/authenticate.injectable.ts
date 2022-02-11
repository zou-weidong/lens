/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterId } from "../../../../common/clusters/cluster-types";
import shellRequestAuthenticatorInjectable from "./authenticator.injectable";

export type AuthenticateRequest = (clusterId: ClusterId, tabId: string, token: string) => boolean;

const authenticateRequestInjectable = getInjectable({
  instantiate: (di): AuthenticateRequest => {
    const authenticator = di.inject(shellRequestAuthenticatorInjectable);

    return (clusterId, tabId, token) => authenticator.authenticate(clusterId, tabId, token);
  },
  id: "authenticate-request",
});

export default authenticateRequestInjectable;
