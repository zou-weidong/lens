/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import registeredItemsInjectable from "./registered-items.injectable";

const kubeObjectMenuItemsInjectable = getInjectable({
  id: "kube-object-menu-items",
  instantiate: (di, { kubeObject }: { kubeObject: KubeObject }) => {
    const registeredItems = di.inject(registeredItemsInjectable);

    if (!kubeObject) {
      return [];
    }

    return registeredItems.get()
      .filter(item => item.satisfies(kubeObject))
      .map(item => item.components.MenuItem);
  },
  lifecycle: lifecycleEnum.transient,
});

export default kubeObjectMenuItemsInjectable;
