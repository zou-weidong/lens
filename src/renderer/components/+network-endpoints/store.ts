/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import type { Endpoint, EndpointApi } from "../../../common/k8s-api/endpoints";

export class EndpointStore extends KubeObjectStore<Endpoint, EndpointApi> {
  constructor(api: EndpointApi) {
    super(api);
  }
}
