/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { action } from "mobx";
import type { KubeObjectRef } from "../../../../common/k8s-api/url/parse.injectable";
import { KubeObject } from "../../../../common/k8s-api/kube-object";
import apiManagerInjectable from "../../../../common/k8s-api/api-manager.injectable";
import kubeSelectedUrlParamInjectable from "./selected.injectable";
import detailsSelflinkPageParamInjectable from "./selflink.injectable";

export interface ShowDetailsOptions {
  /**
   * Whether to reset the highlighting page param
   * @default true
   */
  resetSelected?: boolean;
}

export interface ShowDetails {
  (selfLink: string, opts?: ShowDetailsOptions): void;
  (ref: KubeObjectRef | { selfLink: string }, opts?: ShowDetailsOptions): void;
  (ref: KubeObjectRef, parentObject?: KubeObject, opts?: ShowDetailsOptions): void;
}

function isObjectLink(refOrObject: KubeObjectRef | { selfLink: string }): refOrObject is { selfLink: string } {
  return typeof (refOrObject as any).selfLink === "string";
}

const showDetailsInjectable = getInjectable({
  id: "show-details",
  instantiate: (di): ShowDetails => {
    const kubeSelectedUrlParam = di.inject(kubeSelectedUrlParamInjectable);
    const detailsSelflinkPageParam = di.inject(detailsSelflinkPageParamInjectable);
    const apiManager = di.inject(apiManagerInjectable);

    return action((refOrLinkOrObject: string | KubeObjectRef | { selfLink: string }, parentOrOpts?: ShowDetailsOptions | KubeObject, maybeOpts?: ShowDetailsOptions) => {
      const parent = parentOrOpts instanceof KubeObject
        ? parentOrOpts
        : undefined;
      const { resetSelected = true } = (
        parentOrOpts instanceof KubeObject
          ? maybeOpts
          : parentOrOpts
      ) ?? {};
      const selfLink = typeof refOrLinkOrObject === "string"
        ? refOrLinkOrObject
        : isObjectLink(refOrLinkOrObject)
          ? refOrLinkOrObject.selfLink
          : apiManager.lookupApiLink(refOrLinkOrObject, parent);

      if (typeof selfLink !== "string" || selfLink.length === 0) {
        throw new Error("selfLink must a valid link");
      }

      const prev = kubeSelectedUrlParam.get();

      detailsSelflinkPageParam.set(selfLink);

      if (resetSelected) {
        kubeSelectedUrlParam.clear();
      } else {
        kubeSelectedUrlParam.set(prev);
      }
    });
  },
});

export default showDetailsInjectable;
