/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./deployments.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import type { DeploymentStore } from "./store";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import { cssNames } from "../../utils";
import kebabCase from "lodash/kebabCase";
import orderBy from "lodash/orderBy";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { DeploymentsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubeEventStore } from "../+events/store";
import kubeEventStoreInjectable from "../+events/store.injectable";
import deploymentStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  pods = "pods",
  replicas = "replicas",
  age = "age",
  condition = "condition",
}

export interface DeploymentsProps extends RouteComponentProps<DeploymentsRouteParams> {
}

interface Dependencies {
  kubeEventStore: KubeEventStore;
  deploymentStore: DeploymentStore;
}

const NonInjectedDeployments = observer(({
  kubeEventStore,
  deploymentStore,
}: Dependencies & DeploymentsProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="workload_deployments"
    className="Deployments"
    store={deploymentStore}
    dependentStores={[kubeEventStore]} // status icon component uses event store
    sortingCallbacks={{
      [columnId.name]: deployment => deployment.getName(),
      [columnId.namespace]: deployment => deployment.getNs(),
      [columnId.replicas]: deployment => deployment.getReplicas(),
      [columnId.age]: deployment => deployment.getTimeDiffFromNow(),
      [columnId.condition]: deployment => deployment.getConditionsText(),
    }}
    searchFilters={[
      deployment => deployment.getSearchFields(),
      deployment => deployment.getConditionsText(),
    ]}
    renderHeaderTitle="Deployments"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { className: "warning", showWithColumn: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Pods", className: "pods", id: columnId.pods },
      { title: "Replicas", className: "replicas", sortBy: columnId.replicas, id: columnId.replicas },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      { title: "Conditions", className: "conditions", sortBy: columnId.condition, id: columnId.condition },
    ]}
    renderTableContents={deployment => [
      deployment.getName(),
      <KubeObjectStatusIcon key="icon" object={deployment}/>,
      deployment.getNs(),
      `${deployment.status.availableReplicas || 0}/${deployment.status.replicas || 0}`,
      deployment.getReplicas(),
      deployment.getAge(),
      orderBy(deployment.getConditions(true), "type", "asc")
        .map(({ type, message }) => (
          <span key={type} className={cssNames("condition", kebabCase(type))} title={message}>
            {type}
          </span>
        )),
    ]}
  />
));

export const Deployments = withInjectables<Dependencies, DeploymentsProps>(NonInjectedDeployments, {
  getProps: (di, props) => ({
    ...props,
    kubeEventStore: di.inject(kubeEventStoreInjectable),
    deploymentStore: di.inject(deploymentStoreInjectable),
  }),
});

