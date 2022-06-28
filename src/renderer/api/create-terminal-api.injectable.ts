/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import assert from "assert";
import hostedClusterIdInjectable from "../cluster-frame-context/hosted-cluster-id.injectable";
import getShellAuthTokenInjectable from "../../common/shell-authentication/get-auth-token.injectable";
import type { TerminalApiQuery } from "./terminal-api";
import { TerminalApi } from "./terminal-api";

export type CreateTerminalApi = (query: TerminalApiQuery) => TerminalApi;

const createTerminalApiInjectable = getInjectable({
  id: "create-terminal-api",
  instantiate: (di): CreateTerminalApi => {
    const hostedClusterId = di.inject(hostedClusterIdInjectable);
    const getShellAuthToken = di.inject(getShellAuthTokenInjectable);

    return (query) => {
      assert(hostedClusterId, "Can only create terminal APIs within a cluster frame");

      return new TerminalApi({
        hostedClusterId,
        getShellAuthToken,
      }, query);
    };
  },
});

export default createTerminalApiInjectable;
