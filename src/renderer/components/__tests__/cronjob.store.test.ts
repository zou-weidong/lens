/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import type { CronJobStore } from "../+workloads-cronjobs/store";
import cronJobStoreInjectable from "../+workloads-cronjobs/store.injectable";
import type { CronJobSpec } from "../../../common/k8s-api/endpoints";
import { CronJob } from "../../../common/k8s-api/endpoints";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";

const spec: CronJobSpec = {
  schedule: "test",
  concurrencyPolicy: "test",
  suspend: true,
  jobTemplate: {
    metadata: {},
    spec: {
      template: {
        metadata: {},
        spec: {
          containers: [],
          restartPolicy: "restart",
          terminationGracePeriodSeconds: 1,
          dnsPolicy: "no",
          hostPID: true,
          schedulerName: "string",
        },
      },
    },
  },
  successfulJobsHistoryLimit: 1,
  failedJobsHistoryLimit: 1,
};

const scheduledCronJob = new CronJob({
  apiVersion: "foo",
  kind: "CronJob",
  metadata: {
    name: "scheduledCronJob",
    resourceVersion: "scheduledCronJob",
    uid: "scheduledCronJob",
    namespace: "default",
  },
  spec: {
    ...spec,
    suspend: false,
  },
});

const suspendedCronJob = new CronJob({
  apiVersion: "foo",
  kind: "CronJob",
  metadata: {
    name: "suspendedCronJob",
    resourceVersion: "suspendedCronJob",
    uid: "suspendedCronJob",
    namespace: "default",
  },
  spec,
});

const otherSuspendedCronJob = new CronJob({
  apiVersion: "foo",
  kind: "CronJob",
  metadata: {
    name: "otherSuspendedCronJob",
    resourceVersion: "otherSuspendedCronJob",
    uid: "otherSuspendedCronJob",
    namespace: "default",
  },
  spec,
});

describe("CronJob Store tests", () => {
  let cronJobStore: CronJobStore;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    cronJobStore = di.inject(cronJobStoreInjectable);
  });

  it("gets CronJob statuses in proper sorting order", () => {
    const statuses = Object.entries(cronJobStore.getStatuses([
      suspendedCronJob,
      otherSuspendedCronJob,
      scheduledCronJob,
    ]));

    expect(statuses).toEqual([
      ["scheduled", 1],
      ["suspended", 2],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(cronJobStore.getStatuses([scheduledCronJob]));

    expect(statuses).toEqual([
      ["scheduled", 1],
      ["suspended", 0],
    ]);

    statuses = Object.entries(cronJobStore.getStatuses([suspendedCronJob]));

    expect(statuses).toEqual([
      ["scheduled", 0],
      ["suspended", 1],
    ]);
  });
});
