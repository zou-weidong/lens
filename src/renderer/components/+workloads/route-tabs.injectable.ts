/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { WorkloadsOverview } from "../+workloads-overview/overview";
import { Pods } from "../+workloads-pods";
import { Deployments } from "../+workloads-deployments";
import { DaemonSets } from "../+workloads-daemonsets";
import { StatefulSets } from "../+workloads-statefulsets";
import { Jobs } from "../+workloads-jobs";
import { CronJobs } from "../+workloads-cronjobs";
import { ReplicaSets } from "../+workloads-replicasets";
import * as routes from "../../../common/routes";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";
import allowedResourcesInjectable from "../../clusters/allowed-resources.injectable";

interface Dependencies {
  allowedResources: AllowedResources;
}

function getRouteTabs({ allowedResources }: Dependencies) {
  return computed(() => {
    const tabs: TabLayoutRoute[] = [
      {
        title: "Overview",
        component: WorkloadsOverview,
        url: routes.overviewURL(),
        routePath: routes.overviewRoute.path.toString(),
      },
    ];

    if (allowedResources.has("pods")) {
      tabs.push({
        title: "Pods",
        component: Pods,
        url: routes.podsURL(),
        routePath: routes.podsRoute.path.toString(),
      });
    }

    if (allowedResources.has("deployments")) {
      tabs.push({
        title: "Deployments",
        component: Deployments,
        url: routes.deploymentsURL(),
        routePath: routes.deploymentsRoute.path.toString(),
      });
    }

    if (allowedResources.has("daemonsets")) {
      tabs.push({
        title: "DaemonSets",
        component: DaemonSets,
        url: routes.daemonSetsURL(),
        routePath: routes.daemonSetsRoute.path.toString(),
      });
    }

    if (allowedResources.has("statefulsets")) {
      tabs.push({
        title: "StatefulSets",
        component: StatefulSets,
        url: routes.statefulSetsURL(),
        routePath: routes.statefulSetsRoute.path.toString(),
      });
    }

    if (allowedResources.has("replicasets")) {
      tabs.push({
        title: "ReplicaSets",
        component: ReplicaSets,
        url: routes.replicaSetsURL(),
        routePath: routes.replicaSetsRoute.path.toString(),
      });
    }

    if (allowedResources.has("jobs")) {
      tabs.push({
        title: "Jobs",
        component: Jobs,
        url: routes.jobsURL(),
        routePath: routes.jobsRoute.path.toString(),
      });
    }

    if (allowedResources.has("cronjobs")) {
      tabs.push({
        title: "CronJobs",
        component: CronJobs,
        url: routes.cronJobsURL(),
        routePath: routes.cronJobsRoute.path.toString(),
      });
    }

    return tabs;
  });
}

const workloadsRouteTabsInjectable = getInjectable({
  id: "workloads-route-tabs",

  instantiate: (di) => getRouteTabs({
    allowedResources: di.inject(allowedResourcesInjectable),
  }),
});

export default workloadsRouteTabsInjectable;
