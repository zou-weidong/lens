/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import rendererExtensionsInjectable from "../../../extensions/renderer-extensions.injectable";
import { staticKubeObjectMenuItems } from "./static-items";

const registeredItemsInjectable = getInjectable({
  id: "registered-items",
  instantiate: (di) => {
    const extensions = di.inject(rendererExtensionsInjectable);

    return computed(() => {
      return extensions.get()
        .flatMap((extension) => extension.kubeObjectMenuItems)
        .concat(staticKubeObjectMenuItems)
        .map(({ apiVersions, kind, components }) => {
          const versions = new Set(apiVersions);

          return {
            satisfies: (obj: KubeObject) => (
              kind === obj.kind
              && versions.has(obj.apiVersion)
            ),
            components,
          };
        });
    });
  },
});

export default registeredItemsInjectable;
