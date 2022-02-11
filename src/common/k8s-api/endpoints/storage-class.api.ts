/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { autoBind } from "../../utils";
import { KubeObject } from "../kube-object";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import type { KubeJsonApiData } from "../kube-json-api";

export class StorageClass extends KubeObject {
  static kind = "StorageClass";
  static namespaced = false;
  static apiBase = "/apis/storage.k8s.io/v1/storageclasses";

  declare provisioner: string; // e.g. "storage.k8s.io/v1"
  declare mountOptions?: string[];
  declare volumeBindingMode: string;
  declare reclaimPolicy: string;
  declare parameters: Partial<Record<string, string>>;

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);
  }

  isDefault() {
    const annotations = this.metadata.annotations || {};

    return (
      annotations["storageclass.kubernetes.io/is-default-class"] === "true" ||
      annotations["storageclass.beta.kubernetes.io/is-default-class"] === "true"
    );
  }

  getVolumeBindingMode() {
    return this.volumeBindingMode || "-";
  }

  getReclaimPolicy() {
    return this.reclaimPolicy || "-";
  }
}

export class StorageClassApi extends KubeApi<StorageClass> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      ...opts,
      objectConstructor: StorageClass,
    });
  }
}
