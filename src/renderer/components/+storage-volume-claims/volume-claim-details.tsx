/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./volume-claim-details.scss";

import React, { Fragment } from "react";
import { makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge";
import { ResourceMetrics } from "../resource-metrics";
import { VolumeClaimDiskChart } from "./volume-claim-disk-chart";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForPvc, type IPvcMetrics, PersistentVolumeClaim } from "../../../common/k8s-api/endpoints";
import { ClusterMetricsResourceType } from "../../../common/clusters/cluster-types";
import { KubeObjectMeta } from "../kube-object-meta";
import { prevDefault } from "../../utils";
import logger from "../../../common/logger";
import type { ShouldDisplayMetric } from "../../clusters/should-display-metric.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import shouldDisplayMetricInjectable from "../../clusters/should-display-metric.injectable";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";

export interface PersistentVolumeClaimDetailsProps extends KubeObjectDetailsProps<PersistentVolumeClaim> {
}

interface Dependencies {
  shouldDisplayMetric: ShouldDisplayMetric;
  showDetails: ShowDetails;
  podStore: PodStore;
}

@observer
class NonInjectedPersistentVolumeClaimDetails extends React.Component<PersistentVolumeClaimDetailsProps & Dependencies> {
  @observable metrics: IPvcMetrics = null;

  constructor(props: PersistentVolumeClaimDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),
    ]);
  }

  render() {
    const { object: volumeClaim, shouldDisplayMetric, showDetails, podStore } = this.props;

    if (!volumeClaim) {
      return null;
    }

    if (!(volumeClaim instanceof PersistentVolumeClaim)) {
      logger.error("[PersistentVolumeClaimDetails]: passed object that is not an instanceof PersistentVolumeClaim", volumeClaim);

      return null;
    }

    const { storageClassName, accessModes } = volumeClaim.spec;
    const pods = volumeClaim.getPods(podStore.items);

    return (
      <div className="PersistentVolumeClaimDetails">
        {shouldDisplayMetric(ClusterMetricsResourceType.VolumeClaim) && (
          <ResourceMetrics
            loader={async () => {
              this.metrics = await getMetricsForPvc(volumeClaim);
            }}
            tabs={[
              "Disk",
            ]}
            object={volumeClaim}
            metrics={this.metrics}
          >
            <VolumeClaimDiskChart/>
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={volumeClaim}/>
        <DrawerItem name="Access Modes">
          {accessModes.join(", ")}
        </DrawerItem>
        <DrawerItem name="Storage Class Name">
          {storageClassName}
        </DrawerItem>
        <DrawerItem name="Storage">
          {volumeClaim.getStorage()}
        </DrawerItem>
        <DrawerItem name="Pods" className="pods">
          {pods.map(pod => (
            <a key={pod.getId()} onClick={prevDefault(() => showDetails(pod))}>
              {pod.getName()}
            </a>
          ))}
        </DrawerItem>
        <DrawerItem name="Status">
          {volumeClaim.getStatus()}
        </DrawerItem>

        <DrawerTitle title="Selector"/>

        <DrawerItem name="Match Labels" labelsOnly>
          {volumeClaim.getMatchLabels().map(label => <Badge key={label} label={label}/>)}
        </DrawerItem>

        <DrawerItem name="Match Expressions">
          {volumeClaim.getMatchExpressions().map(({ key, operator, values }, i) => (
            <Fragment key={i}>
              <DrawerItem name="Key">{key}</DrawerItem>
              <DrawerItem name="Operator">{operator}</DrawerItem>
              <DrawerItem name="Values">{values.join(", ")}</DrawerItem>
            </Fragment>
          ))}
        </DrawerItem>
      </div>
    );
  }
}

export const PersistentVolumeClaimDetails = withInjectables<Dependencies, PersistentVolumeClaimDetailsProps>(NonInjectedPersistentVolumeClaimDetails, {
  getProps: (di, props) => ({
    ...props,
    shouldDisplayMetric: di.inject(shouldDisplayMetricInjectable),
    showDetails: di.inject(showDetailsInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});
