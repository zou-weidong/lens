/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { PodStore } from "../+workloads-pods/store";
import podStoreInjectable from "../+workloads-pods/store.injectable";
import type { ReplicaSetStore } from "../+workloads-replicasets/replicasets.store";
import replicaSetStoreInjectable from "../+workloads-replicasets/store.injectable";
import { ReplicaSet, Pod } from "../../../common/k8s-api/endpoints";
import { getDiForUnitTesting } from "../../getDiForUnitTesting";

const runningReplicaSet = new ReplicaSet({
  apiVersion: "foo",
  kind: "ReplicaSet",
  metadata: {
    name: "runningReplicaSet",
    resourceVersion: "runningReplicaSet",
    uid: "runningReplicaSet",
    namespace: "default",
  },
});

const failedReplicaSet = new ReplicaSet({
  apiVersion: "foo",
  kind: "ReplicaSet",
  metadata: {
    name: "failedReplicaSet",
    resourceVersion: "failedReplicaSet",
    uid: "failedReplicaSet",
    namespace: "default",
  },
});

const pendingReplicaSet = new ReplicaSet({
  apiVersion: "foo",
  kind: "ReplicaSet",
  metadata: {
    name: "pendingReplicaSet",
    resourceVersion: "pendingReplicaSet",
    uid: "pendingReplicaSet",
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
      kind: "ReplicaSet",
      uid: "runningReplicaSet",
      name: "runningReplicaSet",
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
      kind: "ReplicaSet",
      uid: "pendingReplicaSet",
      name: "pendingReplicaSet",
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
      kind: "ReplicaSet",
      uid: "failedReplicaSet",
      name: "failedReplicaSet",
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

describe("ReplicaSet Store tests", () => {
  let podStore: PodStore;
  let replicaSetStore: ReplicaSetStore;

  beforeEach(() => {
    const di = getDiForUnitTesting();

    podStore = di.inject(podStoreInjectable);
    replicaSetStore = di.inject(replicaSetStoreInjectable);

    podStore.items.replace([
      runningPod,
      failedPod,
      pendingPod,
    ]);
  });

  it("gets ReplicaSet statuses in proper sorting order", () => {
    const statuses = Object.entries(replicaSetStore.getStatuses([
      failedReplicaSet,
      runningReplicaSet,
      pendingReplicaSet,
    ]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 1],
      ["pending", 1],
    ]);
  });

  it("returns 0 for other statuses", () => {
    let statuses = Object.entries(replicaSetStore.getStatuses([runningReplicaSet]));

    expect(statuses).toEqual([
      ["running", 1],
      ["failed", 0],
      ["pending", 0],
    ]);

    statuses = Object.entries(replicaSetStore.getStatuses([failedReplicaSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 1],
      ["pending", 0],
    ]);

    statuses = Object.entries(replicaSetStore.getStatuses([pendingReplicaSet]));

    expect(statuses).toEqual([
      ["running", 0],
      ["failed", 0],
      ["pending", 1],
    ]);
  });
});
