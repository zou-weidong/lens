/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster-overview.module.scss";

import React from "react";
import { reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { NodeStore } from "../+nodes/store";
import type { Disposer } from "../../utils";
import { interval } from "../../utils";
import { TabLayout } from "../layout/tab-layout";
import { Spinner } from "../spinner";
import { ClusterIssues } from "./cluster-issues";
import { ClusterMetrics } from "./cluster-metrics";
import type { ClusterOverviewStore } from "./cluster-overview/store";
import { ClusterPieCharts } from "./cluster-pie-charts";
import { ClusterMetricsResourceType } from "../../../common/clusters/cluster-types";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import clusterOverviewStoreInjectable from "./cluster-overview/store.injectable";
import type { ShouldDisplayMetric } from "../../clusters/should-display-metric.injectable";
import type { Cluster } from "../../../common/clusters/cluster";
import hostedClusterInjectable from "../../clusters/hosted-cluster.injectable";
import shouldDisplayMetricInjectable from "../../clusters/should-display-metric.injectable";
import type { PodStore } from "../+workloads-pods/store";
import type { KubeEventStore } from "../+events/store";
import kubeEventStoreInjectable from "../+events/store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import nodeStoreInjectable from "../+nodes/store.injectable";

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  clusterOverviewStore: ClusterOverviewStore;
  shouldDisplayMetric: ShouldDisplayMetric;
  cluster: Cluster | undefined;
  podStore: PodStore;
  kubeEventStore: KubeEventStore;
  nodeStore: NodeStore;
}

@observer
class NonInjectedClusterOverview extends React.Component<Dependencies> {
  private metricPoller = interval(60, () => this.loadMetrics());

  loadMetrics() {
    if (this.props.cluster?.available) {
      this.props.clusterOverviewStore.loadMetrics();
    }
  }

  componentDidMount() {
    const {
      podStore,
      kubeEventStore,
      subscribeStores,
      clusterOverviewStore,
      nodeStore,
    } = this.props;

    this.metricPoller.start(true);

    disposeOnUnmount(this, [
      subscribeStores([
        podStore,
        kubeEventStore,
        nodeStore,
      ]),

      reaction(
        () => clusterOverviewStore.metricNodeRole, // Toggle Master/Worker node switcher
        () => this.metricPoller.restart(true),
      ),
    ]);
  }

  componentWillUnmount() {
    this.metricPoller.stop();
  }

  renderClusterOverview(isLoaded: boolean) {
    if (!isLoaded) {
      return <Spinner center/>;
    }

    return (
      <>
        <ClusterMetrics/>
        <ClusterPieCharts/>
        <ClusterIssues className={"OnlyClusterIssues"}/>
      </>
    );
  }

  render() {
    const { shouldDisplayMetric, kubeEventStore, nodeStore } = this.props;
    const isLoaded = nodeStore.isLoaded && kubeEventStore.isLoaded;

    return (
      <TabLayout>
        <div className={styles.ClusterOverview} data-testid="cluster-overview-page">
          {shouldDisplayMetric(ClusterMetricsResourceType.Cluster) && (
            this.renderClusterOverview(isLoaded)
          )}
        </div>
      </TabLayout>
    );
  }
}

export const ClusterOverview = withInjectables<Dependencies>(NonInjectedClusterOverview, {
  getProps: (di) => ({
    subscribeStores: di.inject(subscribeStoresInjectable),
    clusterOverviewStore: di.inject(clusterOverviewStoreInjectable),
    cluster: di.inject(hostedClusterInjectable),
    shouldDisplayMetric: di.inject(shouldDisplayMetricInjectable),
    kubeEventStore: di.inject(kubeEventStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    nodeStore: di.inject(nodeStoreInjectable),
  }),
});
