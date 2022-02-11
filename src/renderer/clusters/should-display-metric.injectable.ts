/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import type { ClusterMetricsResourceType } from "../../common/clusters/cluster-types";
import type { Cluster } from "../../common/clusters/cluster";
import hostedClusterInjectable from "./hosted-cluster.injectable";

export type ShouldDisplayMetric = (type: ClusterMetricsResourceType) => boolean;

interface Dependencies {
  cluster: Cluster;
}

const shouldDisplayMetric = ({ cluster }: Dependencies): ShouldDisplayMetric => (
  (type) => !cluster.isMetricHidden(type)
);

const shouldDisplayMetricInjectable = getInjectable({
  instantiate: (di) => shouldDisplayMetric({
    cluster: di.inject(hostedClusterInjectable),
  }),
  id: "should-display-metric",
});

export default shouldDisplayMetricInjectable;
