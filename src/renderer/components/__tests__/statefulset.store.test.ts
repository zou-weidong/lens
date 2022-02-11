/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import type { StatefulSetStore } from "../+workloads-statefulsets/store";
import statefulSetStoreInjectable from "../+workloads-statefulsets/store.injectable";
import { StatefulSet, Pod } from "../../../common/k8s-api/endpoints";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";

const runningStatefulSet = new StatefulSet({
  apiVersion: "foo",
  kind: "StatefulSet",
  metadata: {
    name: "runningStatefulSet",
    resourceVersion: "runningStatefulSet",
    uid: "runningStatefulSet",
    namespace: "default",
  },
});

const failedStatefulSet = new StatefulSet({
  apiVersion: "foo",
  kind: "StatefulSet",
  metadata: {
    name: "failedStatefulSet",
    resourceVersion: "failedStatefulSet",
    uid: "failedStatefulSet",
    namespace: "default",
  },
});

const pendingStatefulSet = new StatefulSet({
  apiVersion: "foo",
  kind: "StatefulSet",
  metadata: {
    name: "pendingStatefulSet",
    resourceVersion: "pendingStatefulSet",
    uid: "pendingStatefulSet",
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
      kind: "StatefulSet",
      uid: "runningStatefulSet",
      name: "runningStatefulSet",
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
      kind: "StatefulSet",
      uid: "pendingStatefulSet",
      name: "pendingStatefulSet",
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
      kind: "StatefulSet",
      uid: "failedStatefulSet",
      name: "failedStatefulSet",
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

describe("StatefulSet Store tests", () => {
  let podStore: PodStore;
  let statefulSetStore: StatefulSetStore;

  beforeAll(() => {
    const di = getDiForUnitTesting();

    podStore = di.inject(podStoreInjectable);
    statefulSetStore = di.inject(statefulSetStoreInjectable);

    // Add pods to pod store
    podStore.items.replace([
      runningPod,
      failedPod,
      pendingPod,
    ]);
  });

  it("gets StatefulSet statuses in proper sorting order", () => {
    const statuses = Object.entries(statefulSetStore.getStatuses([
      failedStatefulSet,
      runningStatefulSet,
      pendingStatefulSet,
    ]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 1],
      ["pending", 1],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(statefulSetStore.getStatuses([runningStatefulSet]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 0],
      ["pending", 0],
    ]);

    statuses = Object.entries(statefulSetStore.getStatuses([failedStatefulSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 1],
      ["pending", 0],
    ]);

    statuses = Object.entries(statefulSetStore.getStatuses([pendingStatefulSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 0],
      ["pending", 1],
    ]);
  });
});
