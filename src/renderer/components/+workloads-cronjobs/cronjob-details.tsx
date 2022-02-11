/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./cronjob-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem, DrawerTitle } from "../drawer";
import { Badge } from "../badge/badge";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import type { Job } from "../../../common/k8s-api/endpoints";
import { CronJob } from "../../../common/k8s-api/endpoints";
import { KubeObjectMeta } from "../kube-object-meta";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { Disposer } from "../../../common/utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import { prevDefault } from "../../utils";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import cronJobStoreInjectable from "./store.injectable";
import type { JobStore } from "../+workloads-jobs/store";
import jobStoreInjectable from "../+workloads-jobs/store.injectable";
import type { CronJobStore } from "./store";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";

export interface CronJobDetailsProps extends KubeObjectDetailsProps<CronJob> {
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  showDetails: ShowDetails;
  cronJobStore: CronJobStore;
  jobStore: JobStore;
}

@observer
class NonInjectedCronJobDetails extends React.Component<CronJobDetailsProps & Dependencies> {
  componentDidMount() {
    const {
      cronJobStore,
      jobStore,
      subscribeStores,
    } = this.props;

    disposeOnUnmount(this, [
      subscribeStores([
        jobStore,
        cronJobStore,
      ]),
    ]);
  }

  render() {
    const { object: cronJob, showDetails, cronJobStore, jobStore } = this.props;

    if (!cronJob) {
      return null;
    }

    if (!(cronJob instanceof CronJob)) {
      logger.error("[CronJobDetails]: passed object that is not an instanceof CronJob", cronJob);

      return null;
    }

    const childJobs = jobStore.getJobsByOwner(cronJob);

    return (
      <div className="CronJobDetails">
        <KubeObjectMeta object={cronJob}/>
        <DrawerItem name="Schedule">
          {
            cronJob.isNeverRun()
              ? `never (${cronJob.getSchedule()})`
              : cronJob.getSchedule()
          }
        </DrawerItem>
        <DrawerItem name="Active">
          {cronJobStore.getActiveJobsNum(cronJob)}
        </DrawerItem>
        <DrawerItem name="Suspend">
          {cronJob.getSuspendFlag()}
        </DrawerItem>
        <DrawerItem name="Last schedule">
          {cronJob.getLastScheduleTime()}
        </DrawerItem>
        {childJobs.length > 0 &&
          <>
            <DrawerTitle title="Jobs"/>
            {childJobs.map((job: Job) => {
              const selectors = job.getSelectors();
              const condition = job.getCondition();

              return (
                <div className="job" key={job.getId()}>
                  <div className="title">
                    <a onClick={prevDefault(() => showDetails(job))}>
                      {job.getName()}
                    </a>
                  </div>
                  <DrawerItem name="Condition" className="conditions" labelsOnly>
                    {condition && (
                      <Badge
                        label={condition.type}
                        className={kebabCase(condition.type)}
                      />
                    )}
                  </DrawerItem>
                  <DrawerItem name="Selector" labelsOnly>
                    {
                      selectors.map(label => <Badge key={label} label={label}/>)
                    }
                  </DrawerItem>
                </div>
              );})
            }
          </>
        }
      </div>
    );
  }
}

export const CronJobDetails = withInjectables<Dependencies, CronJobDetailsProps>(NonInjectedCronJobDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    showDetails: di.inject(showDetailsInjectable),
    cronJobStore: di.inject(cronJobStoreInjectable),
    jobStore: di.inject(jobStoreInjectable),
  }),
});
