/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./details.scss";

import React from "react";
import upperFirst from "lodash/upperFirst";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerItemLabels } from "../drawer";
import { Badge } from "../badge";
import { ResourceMetrics } from "../resource-metrics";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { IClusterMetrics } from "../../../common/k8s-api/endpoints";
import { formatNodeTaint, getMetricsByNodeNames, Node } from "../../../common/k8s-api/endpoints";
import { NodeCharts } from "./node-charts";
import { makeObservable, observable, reaction } from "mobx";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { ClusterMetricsResourceType } from "../../../common/clusters/cluster-types";
import { NodeDetailsResources } from "./details-resources";
import { DrawerTitle } from "../drawer/drawer-title";
import type { Disposer } from "../../utils";
import { boundMethod } from "../../utils";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ShouldDisplayMetric } from "../../clusters/should-display-metric.injectable";
import shouldDisplayMetricInjectable from "../../clusters/should-display-metric.injectable";
import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";

export interface NodeDetailsProps extends KubeObjectDetailsProps<Node> {
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  shouldDisplayMetic: ShouldDisplayMetric;
  podStore: PodStore;
}

@observer
class NonInjectedNodeDetails extends React.Component<NodeDetailsProps & Dependencies> {
  @observable metrics: Partial<IClusterMetrics>;

  constructor(props: NodeDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    const {
      podStore,
      subscribeStores,
    } = this.props;

    disposeOnUnmount(this, [
      reaction(() => this.props.object.getName(), () => {
        this.metrics = null;
      }),

      subscribeStores([
        podStore,
      ]),
    ]);
  }

  @boundMethod
  async loadMetrics() {
    const { object: node } = this.props;

    this.metrics = await getMetricsByNodeNames([node.getName()]);
  }

  render() {
    const { object: node, shouldDisplayMetic, podStore } = this.props;

    if (!node) {
      return null;
    }

    if (!(node instanceof Node)) {
      logger.error("[NodeDetails]: passed object that is not an instanceof Node", node);

      return null;
    }

    const { status } = node;
    const { nodeInfo, addresses } = status;
    const conditions = node.getActiveConditions();
    const taints = node.getTaints();
    const childPods = podStore.getPodsByNode(node.getName());

    return (
      <div className="NodeDetails">
        {shouldDisplayMetic(ClusterMetricsResourceType.Node) && podStore.isLoaded && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={[
              "CPU",
              "Memory",
              "Disk",
              "Pods",
            ]}
            object={node}
            metrics={this.metrics}
          >
            <NodeCharts/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={node} hideFields={["labels", "annotations", "uid", "resourceVersion", "selfLink"]}/>
        {addresses &&
        <DrawerItem name="Addresses">
          {
            addresses.map(({ type, address }) => (
              <p key={type}>{type}: {address}</p>
            ))
          }
        </DrawerItem>
        }
        <DrawerItem name="OS">
          {nodeInfo.operatingSystem} ({nodeInfo.architecture})
        </DrawerItem>
        <DrawerItem name="OS Image">
          {nodeInfo.osImage}
        </DrawerItem>
        <DrawerItem name="Kernel version">
          {nodeInfo.kernelVersion}
        </DrawerItem>
        <DrawerItem name="Container runtime">
          {nodeInfo.containerRuntimeVersion}
        </DrawerItem>
        <DrawerItem name="Kubelet version">
          {nodeInfo.kubeletVersion}
        </DrawerItem>
        <DrawerItemLabels
          name="Labels"
          labels={node.getLabels()}
        />
        <DrawerItemLabels
          name="Annotations"
          labels={node.getAnnotations()}
        />
        {taints.length > 0 && (
          <DrawerItem name="Taints" labelsOnly>
            {taints.map(taint => <Badge key={taint.key} label={formatNodeTaint(taint)} />)}
          </DrawerItem>
        )}
        {conditions &&
        <DrawerItem name="Conditions" className="conditions" labelsOnly>
          {
            conditions.map(condition => {
              const { type } = condition;

              return (
                <Badge
                  key={type}
                  label={type}
                  className={kebabCase(type)}
                  tooltip={{
                    formatters: {
                      tableView: true,
                    },
                    children: Object.entries(condition).map(([key, value]) =>
                      <div key={key} className="flex gaps align-center">
                        <div className="name">{upperFirst(key)}</div>
                        <div className="value">{value}</div>
                      </div>,
                    ),
                  }}
                />
              );
            })
          }
        </DrawerItem>
        }
        <DrawerTitle title="Capacity"/>
        <NodeDetailsResources node={node} type={"capacity"}/>
        <DrawerTitle title="Allocatable"/>
        <NodeDetailsResources node={node} type={"allocatable"}/>
        <PodDetailsList
          pods={childPods}
          owner={node}
          maxCpu={node.getCpuCapacity()}
          maxMemory={node.getMemoryCapacity()}
        />
      </div>
    );
  }
}

export const NodeDetails = withInjectables<Dependencies, NodeDetailsProps>(NonInjectedNodeDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    shouldDisplayMetic: di.inject(shouldDisplayMetricInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});

