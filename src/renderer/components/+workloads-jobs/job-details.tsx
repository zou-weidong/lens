/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./job-details.scss";

import React from "react";
import kebabCase from "lodash/kebabCase";
import { disposeOnUnmount, observer } from "mobx-react";
import { DrawerItem } from "../drawer";
import { Badge } from "../badge";
import { PodDetailsStatuses } from "../+workloads-pods/pod-details-statuses";
import { PodDetailsTolerations } from "../+workloads-pods/pod-details-tolerations";
import { PodDetailsAffinities } from "../+workloads-pods/pod-details-affinities";
import type { KubeObjectDetailsProps } from "../kube-object-details";
import { getMetricsForJobs, type IPodMetrics, Job } from "../../../common/k8s-api/endpoints";
import { PodDetailsList } from "../+workloads-pods/pod-details-list";
import { KubeObjectMeta } from "../kube-object-meta";
import { makeObservable, observable, reaction } from "mobx";
import { podMetricTabs, PodCharts } from "../+workloads-pods/pod-charts";
import { ClusterMetricsResourceType } from "../../../common/clusters/cluster-types";
import { ResourceMetrics } from "../resource-metrics";
import { boundMethod } from "autobind-decorator";
import logger from "../../../common/logger";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { Disposer } from "../../../common/utils";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ShouldDisplayMetric } from "../../clusters/should-display-metric.injectable";
import shouldDisplayMetricInjectable from "../../clusters/should-display-metric.injectable";
import { prevDefault } from "../../utils";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import type { JobStore } from "./store";
import type { PodStore } from "../+workloads-pods/store";
import jobStoreInjectable from "./store.injectable";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";

export interface JobDetailsProps extends KubeObjectDetailsProps<Job> {
}

interface Dependencies {
  subscribeStores: (stores: KubeObjectStore<KubeObject>[]) => Disposer;
  shouldDisplayMetric: ShouldDisplayMetric;
  showDetails: ShowDetails;
  jobStore: JobStore;
  podStore: PodStore;
}

@observer
class NonInjectedJobDetails extends React.Component<JobDetailsProps & Dependencies> {
  @observable metrics: IPodMetrics = null;

  constructor(props: JobDetailsProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    const { podStore, jobStore, subscribeStores } = this.props;

    disposeOnUnmount(this, [
      reaction(() => this.props.object, () => {
        this.metrics = null;
      }),
      subscribeStores([
        podStore,
        jobStore,
      ]),
    ]);
  }

  @boundMethod
  async loadMetrics() {
    const { object: job } = this.props;

    this.metrics = await getMetricsForJobs([job], job.getNs(), "");
  }

  render() {
    const { object: job, shouldDisplayMetric, showDetails, jobStore } = this.props;

    if (!job) {
      return null;
    }

    if (!(job instanceof Job)) {
      logger.error("[JobDetails]: passed object that is not an instanceof Job", job);

      return null;
    }

    const selectors = job.getSelectors();
    const nodeSelector = job.getNodeSelectors();
    const images = job.getImages();
    const childPods = jobStore.getChildPods(job);
    const ownerRefs = job.getOwnerRefs();
    const condition = job.getCondition();

    return (
      <div className="JobDetails">
        {shouldDisplayMetric(ClusterMetricsResourceType.Job) && (
          <ResourceMetrics
            loader={this.loadMetrics}
            tabs={podMetricTabs}
            object={job}
            metrics={this.metrics}
          >
            <PodCharts />
          </ResourceMetrics>
        )}
        <KubeObjectMeta object={job}/>
        <DrawerItem name="Selector" labelsOnly>
          {
            Object.keys(selectors).map(label => <Badge key={label} label={label}/>)
          }
        </DrawerItem>
        {nodeSelector.length > 0 &&
        <DrawerItem name="Node Selector" labelsOnly>
          {
            nodeSelector.map(label => (
              <Badge key={label} label={label}/>
            ))
          }
        </DrawerItem>
        }
        {images.length > 0 &&
        <DrawerItem name="Images">
          {
            images.map(image => <p key={image}>{image}</p>)
          }
        </DrawerItem>
        }
        {ownerRefs.length > 0 &&
        <DrawerItem name="Controlled by">
          { ownerRefs.map(ref => (
            <p key={ref.name}>
              {ref.kind} <a onClick={prevDefault(() => showDetails(ref, job))}>{ref.name}</a>
            </p>
          ))}
        </DrawerItem>
        }
        <DrawerItem name="Conditions" className="conditions" labelsOnly>
          {condition && (
            <Badge
              className={kebabCase(condition.type)}
              label={condition.type}
              tooltip={condition.message}
            />
          )}
        </DrawerItem>
        <DrawerItem name="Completions">
          {job.getDesiredCompletions()}
        </DrawerItem>
        <DrawerItem name="Parallelism">
          {job.getParallelism()}
        </DrawerItem>
        <PodDetailsTolerations workload={job}/>
        <PodDetailsAffinities workload={job}/>
        <DrawerItem name="Pod Status" className="pod-status">
          <PodDetailsStatuses pods={childPods}/>
        </DrawerItem>
        <PodDetailsList pods={childPods} owner={job}/>
      </div>
    );
  }
}

export const JobDetails = withInjectables<Dependencies, JobDetailsProps>(NonInjectedJobDetails, {
  getProps: (di, props) => ({
    ...props,
    subscribeStores: di.inject(subscribeStoresInjectable),
    shouldDisplayMetric: di.inject(shouldDisplayMetricInjectable),
    showDetails: di.inject(showDetailsInjectable),
    jobStore: di.inject(jobStoreInjectable),
    podStore: di.inject(podStoreInjectable),
  }),
});

