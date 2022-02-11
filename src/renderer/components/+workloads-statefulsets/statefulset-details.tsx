/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./statefulset-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { makeObservable, observable, reaction } from "mobx";
import { Badge } from "../badge";
import { DrawerItem } from "../drawer";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForStatefulSets, type IPodMetrics, StatefulSet } from "../../../common/k8s-api/endpoints";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterMetricsResourceType } from "../../../common/clusters/cluster-types";
import type { Disposer } from "../../utils";
import { boundMethod } from "../../utils";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ShouldDisplayMetric } from "../../clusters/should-display-metric.injectable";
import shouldDisplayMetricInjectable from "../../clusters/should-display-metric.injectable";
import type { StatefulSetStore } from "./store";
import statefulSetStoreInjectable from "./store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import type { PodStore } from "../+workloads-pods/store";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";

export interface StatefulSetDetailsProps extends KubeObjectDetailsProps<StatefulSet> {
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  shouldDisplayMetric: ShouldDisplayMetric;
  statefulSetStore: StatefulSetStore;
  podStore: PodStore;
}

@observer
class NonInjectedStatefulSetDetails extends React.Component<StatefulSetDetailsProps & Dependencies> {
  @observable metrics: IPodMetrics = null;

  constructor(props: StatefulSetDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    const {
      podStore,
      subscribeStores,
    } = this.props;

    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),

      subscribeStores([
        podStore,
      ]),
    ]);
  }

  @boundMethod
  async loadMetrics() {
    const { object: statefulSet } = this.props;

    this.metrics = await getMetricsForStatefulSets([statefulSet], statefulSet.getNs(), "");
  }

  render() {
    const { object: statefulSet, shouldDisplayMetric, statefulSetStore, podStore } = this.props;

    if (!statefulSet) {
      return null;
    }

    if (!(statefulSet instanceof StatefulSet)) {
      logger.error("[StatefulSetDetails]: passed object that is not an instanceof StatefulSet", statefulSet);

      return null;
    }

    const images = statefulSet.getImages();
    const selectors = statefulSet.getSelectors();
    const nodeSelector = statefulSet.getNodeSelectors();
    const childPods = statefulSetStore.getChildPods(statefulSet);

    return (
      <div className="StatefulSetDetails">
        {shouldDisplayMetric(ClusterMetricsResourceType.StatefulSet) && podStore.isLoaded && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs}
            object={statefulSet}
            metrics={this.metrics}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={statefulSet}/>
        {selectors.length &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
        }
        {images.length > 0 &&
        <DrawerItem name="Images">
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
        }
        <PodDetailsTolerations workload={statefulSet}/>
        <PodDetailsAffinities workload={statefulSet}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <ResourceMetricsText metrics={this.metrics}/>
        <PodDetailsList pods={childPods} owner={statefulSet}/>
      </div>
    );
  }
}

export const StatefulSetDetails = withInjectables<Dependencies, StatefulSetDetailsProps>(NonInjectedStatefulSetDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    shouldDisplayMetric: di.inject(shouldDisplayMetricInjectable),
    statefulSetStore: di.inject(statefulSetStoreInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});

