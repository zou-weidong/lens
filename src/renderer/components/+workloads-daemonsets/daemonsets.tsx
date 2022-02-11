/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./daemonsets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { DaemonSet } from "../../../common/k8s-api/endpoints";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { Badge } from "../badge";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { DaemonSetsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubeEventStore } from "../+events/store";
import kubeEventStoreInjectable from "../+events/store.injectable";
import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import type { DaemonSetStore } from "./store";
import daemonSetStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  labels = "labels",
  age = "age",
}

export interface DaemonSetsProps extends RouteComponentProps<DaemonSetsRouteParams> {
}

interface Dependencies {
  daemonSetStore: DaemonSetStore;
  podStore: PodStore;
  kubeEventStore: KubeEventStore;
}

const NonInjectedDaemonSets = observer(({
  daemonSetStore,
  podStore,
  kubeEventStore,
}: Dependencies & DaemonSetsProps) => {
  const getNumberOfChildPods = (daemonSet: DaemonSet) => daemonSetStore.getChildPods(daemonSet).length;

  return (
    <KubeObjectListLayout
      isConfigurable
      tableId="workload_daemonsets"
      className="DaemonSets"
      store={daemonSetStore}
      dependentStores={[podStore, kubeEventStore]} // status icon component uses event store
      sortingCallbacks={{
        [columnId.name]: daemonSet => daemonSet.getName(),
        [columnId.namespace]: daemonSet => daemonSet.getNs(),
        [columnId.pods]: daemonSet => getNumberOfChildPods(daemonSet),
        [columnId.age]: daemonSet => daemonSet.getTimeDiffFromNow(),
      }}
      searchFilters={[
        daemonSet => daemonSet.getSearchFields(),
        daemonSet => daemonSet.getLabels(),
      ]}
      renderHeaderTitle="Daemon Sets"
      renderTableHeader={[
        { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
        { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Pods", className: "pods", sortBy: columnId.pods, id: columnId.pods },
        { className: "warning", showWithColumn: columnId.pods },
        { title: "Node Selector", className: "labels scrollable", id: columnId.labels },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      ]}
      renderTableContents={daemonSet => [
        daemonSet.getName(),
        daemonSet.getNs(),
        getNumberOfChildPods(daemonSet),
        <KubeObjectStatusIcon key="icon" object={daemonSet}/>,
        daemonSet.getNodeSelectors().map(selector => (
          <Badge key={selector} label={selector} scrollable/>
        )),
        daemonSet.getAge(),
      ]}
    />
  );
});

export const DaemonSets = withInjectables<Dependencies, DaemonSetsProps>(NonInjectedDaemonSets, {
  getProps: (di, props) => ({
    ...props,
    daemonSetStore: di.inject(daemonSetStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    kubeEventStore: di.inject(kubeEventStoreInjectable),
  }),
});
