/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import getDetailsUrlInjectable from "../../renderer/components/kube-object/details/get-url.injectable";
import hideDetailsInjectable from "../../renderer/components/kube-object/details/hide.injectable";
import showDetailsInjectable, { type ShowDetailsOptions } from "../../renderer/components/kube-object/details/show.injectable";
import createPageParamInjectable from "../../renderer/navigation/create-page-param.injectable";
import isRouteActiveInjectable from "../../renderer/navigation/is-route-active.injectable";
import navigateInjectable from "../../renderer/navigation/navigate.injectable";
import { asLegacyGlobalForExtensionApi } from "../di-legacy-globals/for-extension-api";

export type { PageParamInit, PageParam } from "../../renderer/navigation/page-param";
export type { URLParams } from "../../common/utils";
export type {
  ShowDetailsOptions,
};

export const createPageParam = asLegacyGlobalForExtensionApi(createPageParamInjectable);
export const navigate = asLegacyGlobalForExtensionApi(navigateInjectable);
export const isActiveRoute = asLegacyGlobalForExtensionApi(isRouteActiveInjectable);
export const hideDetails = asLegacyGlobalForExtensionApi(hideDetailsInjectable);

const _showDetails = asLegacyGlobalForExtensionApi(showDetailsInjectable);
const _getDetailsUrl = asLegacyGlobalForExtensionApi(getDetailsUrlInjectable);

export function showDetails(selfLink: string, opts?: ShowDetailsOptions): void;
/**
 * @deprecated use the opts version instead
 */
export function showDetails(selfLink: string, resetSelected?: boolean): void;

export function showDetails(selfLink: string, resetSelected?: boolean | ShowDetailsOptions): void {
  const opts = typeof resetSelected === "boolean"
    ? { resetSelected }
    : resetSelected;

  _showDetails(selfLink, opts);
}

/**
 * @deprecated use `showDetails` instead
 */
export function getDetailsUrl(selfLink: string, resetSelected?: boolean, mergeGlobals?: boolean): string {
  return _getDetailsUrl(selfLink, { resetSelected, mergeGlobals });
}
