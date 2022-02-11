/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeObjectMetadata } from "../kube-object";
import { KubeObject } from "../kube-object";
import { autoBind, unitsToBytes } from "../../utils";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";

export interface PersistentVolumeSpec {
  capacity: {
    storage: string; // 8Gi
  };
  flexVolume: {
    driver: string; // ceph.rook.io/rook-ceph-system,
    options: {
      clusterNamespace: string; // rook-ceph,
      image: string; // pvc-c5d7c485-9f1b-11e8-b0ea-9600000e54fb,
      pool: string; // replicapool,
      storageClass: string; // rook-ceph-block
    };
  };
  mountOptions?: string[];
  accessModes: string[]; // [ReadWriteOnce]
  claimRef: {
    kind: string; // PersistentVolumeClaim,
    namespace: string; // storage,
    name: string; // nfs-provisioner,
    uid: string; // c5d7c485-9f1b-11e8-b0ea-9600000e54fb,
    apiVersion: string; // v1,
    resourceVersion: string; // 292180
  };
  persistentVolumeReclaimPolicy: string; // Delete,
  storageClassName: string; // rook-ceph-block
  nfs?: {
    path: string;
    server: string;
  };
}

export interface PersistentVolumeStatus {
  phase: string;
  reason?: string;
}

export class PersistentVolume extends KubeObject<KubeObjectMetadata, PersistentVolumeStatus, PersistentVolumeSpec> {
  static kind = "PersistentVolume";
  static namespaced = false;
  static apiBase = "/api/v1/persistentvolumes";

  constructor(data: KubeJsonApiData<KubeObjectMetadata, PersistentVolumeStatus, PersistentVolumeSpec>) {
    super(data);
    autoBind(this);
  }

  getCapacity(inBytes = false) {
    const capacity = this.spec.capacity;

    if (capacity) {
      if (inBytes) return unitsToBytes(capacity.storage);

      return capacity.storage;
    }

    return 0;
  }

  getStatus() {
    return this.status?.phase || "-";
  }

  getStorageClass(): string {
    return this.spec.storageClassName;
  }

  getClaimRefName(): string {
    return this.spec.claimRef?.name ?? "";
  }

  getStorageClassName() {
    return this.spec.storageClassName || "";
  }
}

export class PersistentVolumeApi extends KubeApi<PersistentVolume> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: PersistentVolume,
      ...opts,
    });
  }
}
