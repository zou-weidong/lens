/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { KubeJsonApiData } from "../kube-json-api";
import type { Patch } from "rfc6902";

export interface ResourceApplierApi {
  readonly annotations: ReadonlyArray<string>;
  update(resource: object | string): Promise<KubeJsonApiData>;
  patch(name: string, kind: string, ns: string, patch: Patch): Promise<KubeJsonApiData>;
}
