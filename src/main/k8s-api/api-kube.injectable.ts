/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { apiKubeInjectionToken } from "../../common/k8s-api/api-kube.token";

/**
 * NOTE: this is here because KubeApi<T> currently references it in its constructor
 * even though this was and is only relavent in a cluster frame
 */
const apiKubeInjectable = getInjectable({
  instantiate: () => undefined,
  injectionToken: apiKubeInjectionToken,
  id: "api-kube",
});

export default apiKubeInjectable;
