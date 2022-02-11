/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { JobStore } from "../+workloads-jobs/store";
import jobStoreInjectable from "../+workloads-jobs/store.injectable";
import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import { Job, Pod } from "../../../common/k8s-api/endpoints";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";

const runningJob = new Job({
  apiVersion: "foo",
  kind: "Job",
  metadata: {
    name: "runningJob",
    resourceVersion: "runningJob",
    uid: "runningJob",
    namespace: "default",
  },
});

const failedJob = new Job({
  apiVersion: "foo",
  kind: "Job",
  metadata: {
    name: "failedJob",
    resourceVersion: "failedJob",
    uid: "failedJob",
    namespace: "default",
  },
});

const pendingJob = new Job({
  apiVersion: "foo",
  kind: "Job",
  metadata: {
    name: "pendingJob",
    resourceVersion: "pendingJob",
    uid: "pendingJob",
    namespace: "default",
  },
});

const succeededJob = new Job({
  apiVersion: "foo",
  kind: "Job",
  metadata: {
    name: "succeededJob",
    resourceVersion: "succeededJob",
    uid: "succeededJob",
    namespace: "default",
  },
});

const runningPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar",
    resourceVersion: "foobar",
    uid: "foobar",
    ownerReferences: [{
      apiVersion: "foo",
      kind: "Job",
      uid: "runningJob",
      name: "runningJob",
    }],
    namespace: "default",
  },
  status: {
    phase: "Running",
    conditions: [
      {
        type: "Initialized",
        status: "True",
        lastProbeTime: 1,
        lastTransitionTime: "1",
      },
      {
        type: "Ready",
        status: "True",
        lastProbeTime: 1,
        lastTransitionTime: "1",
      },
    ],
    hostIP: "10.0.0.1",
    podIP: "10.0.0.1",
    startTime: "now",
    containerStatuses: [],
    initContainerStatuses: [],
  },
});

const pendingPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar-pending",
    resourceVersion: "foobar",
    uid: "foobar-pending",
    ownerReferences: [{
      apiVersion: "foo",
      kind: "Job",
      uid: "pendingJob",
      name: "pendingJob",
    }],
    namespace: "default",
  },
});

const failedPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar-failed",
    resourceVersion: "foobar",
    uid: "foobar-failed",
    ownerReferences: [{
      apiVersion: "foo",
      kind: "Job",
      uid: "failedJob",
      name: "failedJob",
    }],
    namespace: "default",
  },
  status: {
    phase: "Failed",
    conditions: [],
    hostIP: "10.0.0.1",
    podIP: "10.0.0.1",
    startTime: "now",
  },
});

const succeededPod = new Pod({
  apiVersion: "foo",
  kind: "Pod",
  metadata: {
    name: "foobar-succeeded",
    resourceVersion: "foobar",
    uid: "foobar-succeeded",
    ownerReferences: [{
      apiVersion: "foo",
      kind: "Job",
      uid: "succeededJob",
      name: "succeededJob",
    }],
  },
  status: {
    phase: "Succeeded",
    conditions: [],
    hostIP: "10.0.0.1",
    podIP: "10.0.0.1",
    startTime: "now",
  },
});

describe("Job Store tests", () => {
  let podStore: PodStore;
  let jobStore: JobStore;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    podStore = di.inject(podStoreInjectable);
    jobStore = di.inject(jobStoreInjectable);

    podStore.items.replace([
      runningPod,
      failedPod,
      pendingPod,
      succeededPod,
    ]);
  });

  it("gets Job statuses in proper sorting order", () => {
    const statuses = Object.entries(jobStore.getStatuses([
      failedJob,
      succeededJob,
      runningJob,
      pendingJob,
    ]));

    expect(statuses).toEqual([
      ["succeeded", 1],
      ["running", 1],
      ["failed", 1],
      ["pending", 1],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(jobStore.getStatuses([succeededJob]));

    expect(statuses).toEqual([
      ["succeeded", 1],
      ["running", 0],
      ["failed", 0],
      ["pending", 0],
    ]);

    statuses = Object.entries(jobStore.getStatuses([runningJob]));

    expect(statuses).toEqual([
      ["succeeded", 0],
      ["running", 1],
      ["failed", 0],
      ["pending", 0],
    ]);

    statuses = Object.entries(jobStore.getStatuses([failedJob]));

    expect(statuses).toEqual([
      ["succeeded", 0],
      ["running", 0],
      ["failed", 1],
      ["pending", 0],
    ]);

    statuses = Object.entries(jobStore.getStatuses([pendingJob]));

    expect(statuses).toEqual([
      ["succeeded", 0],
      ["running", 0],
      ["failed", 0],
      ["pending", 1],
    ]);
  });
});
