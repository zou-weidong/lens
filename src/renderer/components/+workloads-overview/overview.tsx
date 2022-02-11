/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./overview.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { ReplicaSetStore } from "../+workloads-replicasets/replicasets.store";
import type { WorkloadsOverviewRouteParams } from "../../../common/routes";
import type { IComputedValue } from "mobx";
import { makeObservable, observable, reaction } from "mobx";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { Icon } from "../icon";
import { TooltipPosition } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import type { ClusterFrameContext } from "../../cluster-frame-context/cluster-frame-context";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";
import replicaSetStoreInjectable from "../+workloads-replicasets/store.injectable";
import type { StatefulSetStore } from "../+workloads-statefulsets/store";
import statefulSetStoreInjectable from "../+workloads-statefulsets/store.injectable";
import type { KubeEventStore } from "../+events/store";
import type { CronJobStore } from "../+workloads-cronjobs/store";
import type { DaemonSetStore } from "../+workloads-daemonsets/store";
import type { DeploymentStore } from "../+workloads-deployments/store";
import type { JobStore } from "../+workloads-jobs/store";
import type { PodStore } from "../+workloads-pods/store";
import detailComponentsInjectable from "./detail-components.injectable";
import kubeEventStoreInjectable from "../+events/store.injectable";
import cronJobStoreInjectable from "../+workloads-cronjobs/store.injectable";
import daemonSetStoreInjectable from "../+workloads-daemonsets/store.injectable";
import deploymentStoreInjectable from "../+workloads-deployments/store.injectable";
import jobStoreInjectable from "../+workloads-jobs/store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";

export interface WorkloadsOverviewProps extends RouteComponentProps<WorkloadsOverviewRouteParams> {
}

interface Dependencies {
  detailComponents: IComputedValue<React.ComponentType<{}>[]>;
  clusterFrameContext: ClusterFrameContext;
  subscribeStores: SubscribeStores;
  replicaSetStore: ReplicaSetStore;
  statefulSetStore: StatefulSetStore;
  cronJobStore: CronJobStore;
  daemonSetStore: DaemonSetStore;
  deploymentStore: DeploymentStore;
  kubeEventStore: KubeEventStore;
  jobStore: JobStore;
  podStore: PodStore;
}

@observer
class NonInjectedWorkloadsOverview extends React.Component<WorkloadsOverviewProps & Dependencies> {
  @observable loadErrors: string[] = [];

  constructor(props: WorkloadsOverviewProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    const {
      statefulSetStore,
      replicaSetStore,
      clusterFrameContext,
      cronJobStore,
      daemonSetStore,
      deploymentStore,
      kubeEventStore,
      jobStore,
      podStore,
      subscribeStores,
    } = this.props;

    disposeOnUnmount(this, [
      subscribeStores([
        cronJobStore,
        daemonSetStore,
        deploymentStore,
        kubeEventStore,
        jobStore,
        podStore,
        replicaSetStore,
        statefulSetStore,
      ], {
        onLoadFailure: error => this.loadErrors.push(String(error)),
      }),
      reaction(() => clusterFrameContext.contextNamespaces.slice(), () => {
        // clear load errors
        this.loadErrors.length = 0;
      }),
    ]);
  }

  renderLoadErrors() {
    if (this.loadErrors.length === 0) {
      return null;
    }

    return (
      <Icon
        material="warning"
        className="load-error"
        tooltip={{
          children: (
            <>
              {this.loadErrors.map((error, index) => <p key={index}>{error}</p>)}
            </>
          ),
          preferredPositions: TooltipPosition.BOTTOM,
        }}
      />
    );
  }

  render() {
    return (
      <div className="WorkloadsOverview flex column gaps">
        <div className="header flex gaps align-center">
          <h5 className="box grow">Overview</h5>
          {this.renderLoadErrors()}
          <NamespaceSelectFilter />
        </div>

        {this.props.detailComponents.get().map((Details, index) => (
          <Details key={`workload-overview-${index}`} />
        ))}
      </div>
    );
  }
}

export const WorkloadsOverview = withInjectables<Dependencies, WorkloadsOverviewProps>(NonInjectedWorkloadsOverview, {
  getProps: (di, props) => ({
    ...props,
    detailComponents: di.inject(detailComponentsInjectable),
    clusterFrameContext: di.inject(clusterFrameContextInjectable),
    subscribeStores: di.inject(subscribeStoresInjectable),
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    statefulSetStore: di.inject(statefulSetStoreInjectable),
    cronJobStore: di.inject(cronJobStoreInjectable),
    daemonSetStore: di.inject(daemonSetStoreInjectable),
    deploymentStore: di.inject(deploymentStoreInjectable),
    kubeEventStore: di.inject(kubeEventStoreInjectable),
    jobStore: di.inject(jobStoreInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});
