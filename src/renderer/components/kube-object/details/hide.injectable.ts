/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import kubeSelectedUrlParamInjectable from "./selected.injectable";
import detailsSelflinkPageParamInjectable from "./selflink.injectable";

export type HideDetails = () => void;

const hideDetailsInjectable = getInjectable({
  id: "hide-details",
  instantiate: (di): HideDetails => {
    const kubeSelectedUrlParam = di.inject(kubeSelectedUrlParamInjectable);
    const detailsSelflinkPageParam = di.inject(detailsSelflinkPageParamInjectable);

    return action(() => {
      kubeSelectedUrlParam.clear();
      detailsSelflinkPageParam.clear();
    });
  },
});

export default hideDetailsInjectable;
