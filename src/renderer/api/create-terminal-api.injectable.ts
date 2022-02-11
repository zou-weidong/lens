/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hostedClusterIdInjectable from "../clusters/hosted-cluster-id.injectable";
import { TerminalApi, type TerminalApiDependencies, type TerminalApiQuery } from "./terminal-api";

export type CreateTerminalApi = (query: TerminalApiQuery) => TerminalApi;

const createTerminalApiInjectable = getInjectable({
  id: "create-terminal-api",
  instantiate: (di): CreateTerminalApi => {
    const deps: TerminalApiDependencies = {
      clusterId: di.inject(hostedClusterIdInjectable),
    };

    return (query) => new TerminalApi(deps, query);
  },
});

export default createTerminalApiInjectable;
