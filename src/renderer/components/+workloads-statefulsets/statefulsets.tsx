/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./statefulsets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { StatefulSetsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubeEventStore } from "../+events/store";
import kubeEventStoreInjectable from "../+events/store.injectable";
import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import type { StatefulSetStore } from "./store";
import statefulSetStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
  replicas = "replicas",
}

export interface StatefulSetsProps extends RouteComponentProps<StatefulSetsRouteParams> {
}

interface Dependencies {
  statefulSetStore: StatefulSetStore;
  podStore: PodStore;
  kubeEventStore: KubeEventStore;
}

const NonInjectedStatefulSets = observer(({
  statefulSetStore,
  podStore,
  kubeEventStore,
}: Dependencies & StatefulSetsProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="workload_statefulsets"
    className="StatefulSets"
    store={statefulSetStore}
    dependentStores={[podStore, kubeEventStore]} // status icon component uses event store, details component uses podStore
    sortingCallbacks={{
      [columnId.name]: statefulSet => statefulSet.getName(),
      [columnId.namespace]: statefulSet => statefulSet.getNs(),
      [columnId.age]: statefulSet => statefulSet.getTimeDiffFromNow(),
      [columnId.replicas]: statefulSet => statefulSet.getReplicas(),
    }}
    searchFilters={[
      statefulSet => statefulSet.getSearchFields(),
    ]}
    renderHeaderTitle="Stateful Sets"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Pods", className: "pods", id: columnId.pods },
      { title: "Replicas", className: "replicas", sortBy: columnId.replicas, id: columnId.replicas },
      { className: "warning", showWithColumn: columnId.replicas },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
    ]}
    renderTableContents={statefulSet => [
      statefulSet.getName(),
      statefulSet.getNs(),
      `${statefulSet.status.readyReplicas || 0}/${statefulSet.status.currentReplicas || 0}`,
      statefulSet.getReplicas(),
      <KubeObjectStatusIcon key="icon" object={statefulSet}/>,
      statefulSet.getAge(),
    ]}
  />
));

export const StatefulSets = withInjectables<Dependencies, StatefulSetsProps>(NonInjectedStatefulSets, {
  getProps: (di, props) => ({
    ...props,
    statefulSetStore: di.inject(statefulSetStoreInjectable),
    podStore: di.inject(podStoreInjectable),
    kubeEventStore: di.inject(kubeEventStoreInjectable),
  }),
});

