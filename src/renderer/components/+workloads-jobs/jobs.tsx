/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./jobs.scss";

import React from "react";
import { observer } from "mobx-react";
import type { RouteComponentProps } from "react-router";
import { KubeObjectListLayout } from "../kube-object-list-layout";
import kebabCase from "lodash/kebabCase";
import { KubeObjectStatusIcon } from "../kube-object-status-icon";
import type { JobsRouteParams } from "../../../common/routes";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { KubeEventStore } from "../+events/store";
import kubeEventStoreInjectable from "../+events/store.injectable";
import type { JobStore } from "./store";
import jobStoreInjectable from "./store.injectable";

enum columnId {
  name = "name",
  namespace = "namespace",
  completions = "completions",
  conditions = "conditions",
  age = "age",
}

export interface JobsProps extends RouteComponentProps<JobsRouteParams> {
}

interface Dependencies {
  kubeEventStore: KubeEventStore;
  jobStore: JobStore;
}

const NonInjectedJobs = observer(({
  kubeEventStore,
  jobStore,
}: Dependencies & JobsProps) => (
  <KubeObjectListLayout
    isConfigurable
    tableId="workload_jobs"
    className="Jobs"
    store={jobStore}
    dependentStores={[kubeEventStore]} // status icon component uses event store
    sortingCallbacks={{
      [columnId.name]: job => job.getName(),
      [columnId.namespace]: job => job.getNs(),
      [columnId.conditions]: job => job.getCondition() != null ? job.getCondition().type : "",
      [columnId.age]: job => job.getTimeDiffFromNow(),
    }}
    searchFilters={[
      job => job.getSearchFields(),
    ]}
    renderHeaderTitle="Jobs"
    renderTableHeader={[
      { title: "Name", className: "name", sortBy: columnId.name, id: columnId.name },
      { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
      { title: "Completions", className: "completions", id: columnId.completions },
      { className: "warning", showWithColumn: columnId.completions },
      { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
      { title: "Conditions", className: "conditions", sortBy: columnId.conditions, id: columnId.conditions },
    ]}
    renderTableContents={job => {
      const condition = job.getCondition();

      return [
        job.getName(),
        job.getNs(),
        `${job.getCompletions()} / ${job.getDesiredCompletions()}`,
        <KubeObjectStatusIcon key="icon" object={job}/>,
        job.getAge(),
        condition && {
          title: condition.type,
          className: kebabCase(condition.type),
        },
      ];
    }}
  />
));

export const Jobs = withInjectables<Dependencies, JobsProps>(NonInjectedJobs, {
  getProps: (di, props) => ({
    ...props,
    kubeEventStore: di.inject(kubeEventStoreInjectable),
    jobStore: di.inject(jobStoreInjectable),
  }),
});
