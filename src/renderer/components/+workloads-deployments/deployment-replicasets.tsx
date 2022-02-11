/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./deployment-replicasets.scss";

import React from "react";
import { observer } from "mobx-react";
import type { ReplicaSet } from "../../../common/k8s-api/endpoints";
import type { KubeObjectMenuProps } from "../kube-object-menu";
import { KubeObjectMenu } from "../kube-object-menu";
import { Spinner } from "../spinner";
import { prevDefault, stopPropagation } from "../../utils";
import { DrawerTitle } from "../drawer";
import { Table, TableCell, TableHead, TableRow } from "../table";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { ReplicaSetStore } from "../+workloads-replicasets/replicasets.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import replicaSetStoreInjectable from "../+workloads-replicasets/store.injectable";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import showDetailsInjectable from "../kube-object/details/show.injectable";


enum sortBy {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  age = "age",
}

export interface DeploymentReplicaSetsProps {
  replicaSets: ReplicaSet[];
}

interface Dependencies {
  replicaSetStore: ReplicaSetStore;
  showDetails: ShowDetails;
}

const NonInjectedDeploymentReplicaSets = observer(({
  replicaSetStore,
  replicaSets,
  showDetails,
}: Dependencies & DeploymentReplicaSetsProps) => {
  const getPodsLength = (replicaSet: ReplicaSet) => replicaSetStore.getChildPods(replicaSet).length;

  if (replicaSets.length === 0) {
    return replicaSetStore.isLoaded && (
      <div className="ReplicaSets">
        <Spinner center/>
      </div>
    );
  }

  return (
    <div className="ReplicaSets flex column">
      <DrawerTitle title="Deploy Revisions"/>
      <Table
        selectable
        tableId="deployment_replica_sets_view"
        scrollable={false}
        sortable={{
          [sortBy.name]: replicaSet => replicaSet.getName(),
          [sortBy.namespace]: replicaSet => replicaSet.getNs(),
          [sortBy.age]: replicaSet => replicaSet.metadata.creationTimestamp,
          [sortBy.pods]: replicaSet => getPodsLength(replicaSet),
        }}
        sortByDefault={{ sortBy: sortBy.pods, orderBy: "desc" }}
        sortSyncWithUrl={false}
        className="box grow"
        items={replicaSets}
        renderRow={replica => (
          <TableRow
            key={replica.getId()}
            sortItem={replica}
            nowrap
            onClick={prevDefault(() => showDetails(replica, { resetSelected: false }))}
          >
            <TableCell className="name">{replica.getName()}</TableCell>
            <TableCell className="warning"><KubeObjectStatusIcon key="icon" object={replica} /></TableCell>
            <TableCell className="namespace">{replica.getNs()}</TableCell>
            <TableCell className="pods">{getPodsLength(replica)}</TableCell>
            <TableCell className="age">{replica.getAge()}</TableCell>
            <TableCell className="actions" onClick={stopPropagation}>
              <ReplicaSetMenu object={replica} />
            </TableCell>
          </TableRow>
        )}
      >
        <TableHead>
          <TableCell className="name" sortBy={sortBy.name}>Name</TableCell>
          <TableCell className="warning"/>
          <TableCell className="namespace" sortBy={sortBy.namespace}>Namespace</TableCell>
          <TableCell className="pods" sortBy={sortBy.pods}>Pods</TableCell>
          <TableCell className="age" sortBy={sortBy.age}>Age</TableCell>
          <TableCell className="actions"/>
        </TableHead>
      </Table>
    </div>
  );
});

export const DeploymentReplicaSets = withInjectables<Dependencies, DeploymentReplicaSetsProps>(NonInjectedDeploymentReplicaSets, {
  getProps: (di, props) => ({
    ...props,
    replicaSetStore: di.inject(replicaSetStoreInjectable),
    showDetails: di.inject(showDetailsInjectable),
  }),
});

export function ReplicaSetMenu(props: KubeObjectMenuProps<ReplicaSet>) {
  return (
    <KubeObjectMenu {...props}/>
  );
}
