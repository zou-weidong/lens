/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./deployment-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { Deployment, getMetricsForDeployments, type IPodMetrics } from "../../../common/k8s-api/endpoints";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { ResourceMetrics, ResourceMetricsText } from "../resource-metrics";
import { PodCharts, podMetricTabs } from "../+workloads-pods/pod-charts";
import { makeObservable, observable, reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import type { ReplicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { DeploymentReplicaSets } from "./deployment-replicasets";
import { ClusterMetricsResourceType } from "../../../common/clusters/cluster-types";
import type { Disposer } from "../../utils";
import { boundMethod } from "../../utils";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ShouldDisplayMetric } from "../../clusters/should-display-metric.injectable";
import shouldDisplayMetricInjectable from "../../clusters/should-display-metric.injectable";
import replicaSetStoreInjectable from "../+workloads-replicasets/store.injectable";
import type { PodStore } from "../+workloads-pods/store";
import type { DeploymentStore } from "./store";
import deploymentStoreInjectable from "./store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";

export interface DeploymentDetailsProps extends KubeObjectDetailsProps<Deployment> {
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  shouldDisplayMetric: ShouldDisplayMetric;
  replicaSetStore: ReplicaSetStore;
  podStore: PodStore;
  deploymentStore: DeploymentStore;
}

@observer
class NonInjectedDeploymentDetails extends React.Component<DeploymentDetailsProps & Dependencies> {
  @observable metrics: IPodMetrics = null;

  constructor(props: DeploymentDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    const {
      podStore,
      replicaSetStore,
      deploymentStore,
      subscribeStores,
    } = this.props;

    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),

      subscribeStores([
        podStore,
        replicaSetStore,
        deploymentStore,
      ]),
    ]);
  }

  @boundMethod
  async loadMetrics() {
    const { object: deployment } = this.props;

    this.metrics = await getMetricsForDeployments([deployment], deployment.getNs(), "");
  }

  render() {
    const { object: deployment, shouldDisplayMetric, replicaSetStore, deploymentStore, podStore } = this.props;

    if (!deployment) {
      return null;
    }

    if (!(deployment instanceof Deployment)) {
      logger.error("[DeploymentDetails]: passed object that is not an instanceof Deployment", deployment);

      return null;
    }

    const { status, spec } = deployment;
    const nodeSelector = deployment.getNodeSelectors();
    const selectors = deployment.getSelectors();
    const childPods = deploymentStore.getChildPods(deployment);
    const replicaSets = replicaSetStore.getReplicaSetsByOwner(deployment);

    return (
      <div className="DeploymentDetails">
        {shouldDisplayMetric(ClusterMetricsResourceType.Deployment) && podStore.isLoaded && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs}
            object={deployment}
            metrics={this.metrics}
          >
            <PodCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={deployment}/>
        <DrawerItem name="Replicas">
          {`${spec.replicas} desired, ${status.updatedReplicas || 0} updated`},{" "}
          {`${status.replicas || 0} total, ${status.availableReplicas || 0} available`},{" "}
          {`${status.unavailableReplicas || 0} unavailable`}
        </DrawerItem>
        {selectors.length > 0 &&
        <DrawerItem name="Selector" labelsOnly>
          {
            selectors.map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        }
        {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector">
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
        }
        <DrawerItem name="Strategy Type">
          {spec.strategy.type}
        </DrawerItem>
        <DrawerItem name="Conditions" className="conditions" labelsOnly>
          {
            deployment
              .getConditions()
              .map(({ type, message, lastTransitionTime, status }) => (
                <Badge
                  key={type}
                  label={type}
                  disabled={status === "False"}
                  className={kebabCase(type)}
                  tooltip={(
                    <>
                      <p>{message}</p>
                      <p>Last transition time: {lastTransitionTime}</p>
                    </>
                  )}
                />
              ))
          }
        </DrawerItem>
        <PodDetailsTolerations workload={deployment}/>
        <PodDetailsAffinities workload={deployment}/>
        <ResourceMetricsText metrics={this.metrics}/>
        <DeploymentReplicaSets replicaSets={replicaSets}/>
        <PodDetailsList pods={childPods} owner={deployment}/>
      </div>
    );
  }
}

export const DeploymentDetails = withInjectables<Dependencies, DeploymentDetailsProps>(NonInjectedDeploymentDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    shouldDisplayMetric: di.inject(shouldDisplayMetricInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    deploymentStore: di.inject(deploymentStoreInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});

