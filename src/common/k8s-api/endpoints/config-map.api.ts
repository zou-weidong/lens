/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObject } from "../kube-object";
import type { KubeJsonApiData } from "../kube-json-api";
import type { DerivedKubeApiOptions } from "../kube-api";
import { KubeApi } from "../kube-api";
import { autoBind } from "../../utils";

export class ConfigMap extends KubeObject {
  static kind = "ConfigMap";
  static namespaced = true;
  static apiBase = "/api/v1/configmaps";

  declare data: Partial<Record<string, string>>;

  constructor(data: KubeJsonApiData) {
    super(data);
    autoBind(this);

    this.data ??= {};
  }

  getKeys(): string[] {
    return Object.keys(this.data);
  }
}

export class ConfigMapApi extends KubeApi<ConfigMap> {
  constructor(opts: DerivedKubeApiOptions = {}) {
    super({
      objectConstructor: ConfigMap,
      ...opts,
    });
  }
}
