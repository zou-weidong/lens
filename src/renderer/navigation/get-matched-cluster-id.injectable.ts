/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { clusterViewRoute, type ClusterViewRouteParams } from "../../common/routes";
import matchRouteInjectable from "./match-route.injectable";

export type GetMatchedClusterId = () => string | undefined;

const getMatchedClusterIdInjectable = getInjectable({
  id: "get-matched-cluster-id",
  instantiate: (di): GetMatchedClusterId => {
    const matchRoute = di.inject(matchRouteInjectable);

    return () => {
      const matched = matchRoute<ClusterViewRouteParams>({
        exact: true,
        path: clusterViewRoute.path,
      });

      return matched?.params.clusterId;
    };
  },
});

export default getMatchedClusterIdInjectable;
