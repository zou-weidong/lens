/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import hideDetailsInjectable from "./hide.injectable";
import kubeSelectedUrlParamInjectable from "./selected.injectable";
import showDetailsInjectable, { ShowDetailsOptions } from "./show.injectable";

export interface ToggleDetails {
  (selfLink: string, opts?: ShowDetailsOptions): void;
}

const toggleDetailsInjectable = getInjectable({
  id: "toggle-details",
  instantiate: (di): ToggleDetails => {
    const kubeSelectedUrlParam = di.inject(kubeSelectedUrlParamInjectable);
    const hideDetails = di.inject(hideDetailsInjectable);
    const showDetails = di.inject(showDetailsInjectable);

    return (selfLink, ...opts) => {
      if (kubeSelectedUrlParam.get() === selfLink) {
        hideDetails();
      } else {
        showDetails(selfLink, ...opts);
      }
    };
  },
});

export default toggleDetailsInjectable;
