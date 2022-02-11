/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import observableHistoryInjectable from "../../../navigation/observable-history.injectable";
import kubeSelectedUrlParamInjectable from "./selected.injectable";
import detailsSelflinkPageParamInjectable from "./selflink.injectable";

export interface GetDetailsUrlOptions {
  /**
   * @default false
   */
  resetSelected?: boolean;

  /**
   * @default true
   */
  mergeGlobals?: boolean;
}

export type GetDetailsUrl = (selfLink: string, opts?: GetDetailsUrlOptions) => string;

const getDetailsUrlInjectable = getInjectable({
  id: "get-details-url",
  instantiate: (di): GetDetailsUrl => {
    const detailsSelflinkPageParam = di.inject(detailsSelflinkPageParamInjectable);
    const kubeSelectedUrlParam = di.inject(kubeSelectedUrlParamInjectable);
    const history = di.inject(observableHistoryInjectable);

    return (selfLink, { mergeGlobals = true, resetSelected = false } = {}) => {
      const params = new URLSearchParams(mergeGlobals ? history.searchParams : "");

      params.set(detailsSelflinkPageParam.name, selfLink);

      if (resetSelected) {
        params.delete(kubeSelectedUrlParam.name);
      } else {
        params.set(kubeSelectedUrlParam.name, kubeSelectedUrlParam.get());
      }

      return `?${params}`;
    };
  },
});

export default getDetailsUrlInjectable;
