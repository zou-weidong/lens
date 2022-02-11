/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Extensions-api -> Custom page registration

import React from "react";
import { observer } from "mobx-react";
import { BaseRegistry } from "./base-registry";
import { LensExtension, sanitizeExtensionName } from "../lens-extension";
import type { LensExtensionId } from "../../common/extensions/manifest";
import { type PageParamInit, type PageParam, createPageParam } from "../renderer-api/navigation";

export interface PageRegistration {
  /**
   * Page ID, part of extension's page url, must be unique within same extension
   * When not provided, first registered page without "id" would be used for page-menus without target.pageId for same extension
   */
  id?: string;
  params?: PageParams<string | Omit<PageParamInit<any>, "name" | "prefix">>;
  components: PageComponents;
}

export interface PageComponents {
  Page: React.ComponentType<any>;
}

export interface PageTarget {
  extensionId?: string;
  pageId?: string;
  params?: PageParams;
}

export interface PageParams<V = any> {
  [paramName: string]: V;
}

export interface PageComponentProps<P extends PageParams = {}> {
  params?: {
    [N in keyof P]: PageParam<P[N]>;
  };
}

export interface RegisteredPage {
  id: string;
  extensionId: string;
  url: string; // registered extension's page URL (without page params)
  params: PageParams<PageParam<any>>; // normalized params
  components: PageComponents; // normalized components
}

export function getExtensionPageUrl(target: PageTarget): string {
  const { extensionId, pageId = "", params: targetParams = {}} = target;

  const pagePath = ["/extension", sanitizeExtensionName(extensionId), pageId]
    .filter(Boolean)
    .join("/").replace(/\/+/g, "/").replace(/\/$/, ""); // normalize multi-slashes (e.g. coming from page.id)

  const pageUrl = new URL(pagePath, `http://localhost`);

  // stringify params to matched target page
  const registeredPage = GlobalPageRegistry.getInstance().getByPageTarget(target) || ClusterPageRegistry.getInstance().getByPageTarget(target);

  if (registeredPage?.params) {
    for (const [name, param] of Object.entries(registeredPage.params)) {
      pageUrl.searchParams.delete(name); // first off, clear existing value(s)

      const values = param.stringify(targetParams[name])
        .filter(Boolean);

      for (const value of values) {
        pageUrl.searchParams.append(name, value);
      }
    }
  }

  return pageUrl.href.replace(pageUrl.origin, "");
}

class PageRegistry extends BaseRegistry<PageRegistration, RegisteredPage> {
  protected getRegisteredItem(page: PageRegistration, ext: LensExtension): RegisteredPage {
    const { id: pageId } = page;
    const extensionId = ext.name;
    const params = this.normalizeParams(extensionId, page.params);
    const components = this.normalizeComponents(page.components, params);
    const url = getExtensionPageUrl({ extensionId, pageId });

    return {
      id: pageId, extensionId, params, components, url,
    };
  }

  protected normalizeComponents(components: PageComponents, params?: PageParams<PageParam<any>>): PageComponents {
    if (params) {
      const { Page } = components;

      // inject extension's page component props.params
      components.Page = observer((props: object) => React.createElement(Page, { params, ...props }));
    }

    return components;
  }

  protected normalizeParams(extensionId: LensExtensionId, params?: PageParams<string | Partial<PageParamInit<any>>>): PageParams<PageParam<any>> {
    if (!params) return undefined;
    const normalizedParams: PageParams<PageParam<any>> = {};

    Object.entries(params).forEach(([paramName, paramValue]) => {
      const paramInit: PageParamInit<any> = {
        name: paramName,
        prefix: `${extensionId}:`,
        defaultValue: paramValue,
      };

      // handle non-string params
      if (typeof paramValue !== "string") {
        const { defaultValue: value, parse, stringify } = paramValue;

        const notAStringValue = typeof value !== "string" || (
          Array.isArray(value) && !value.every(value => typeof value === "string")
        );

        if (notAStringValue && !(parse || stringify)) {
          throw new Error(`PageRegistry: param's "${paramName}" initialization has failed: paramInit.parse() and paramInit.stringify() are required for non string | string[] "defaultValue"`);
        }

        paramInit.defaultValue = value;
        paramInit.parse = parse;
        paramInit.stringify = stringify;
      }

      normalizedParams[paramName] = createPageParam(paramInit);
    });

    return normalizedParams;
  }

  getByPageTarget(target: PageTarget): RegisteredPage | null {
    return this.getItems().find(page => page.extensionId === target.extensionId && page.id === target.pageId) || null;
  }
}

export class ClusterPageRegistry extends PageRegistry {}
export class GlobalPageRegistry extends PageRegistry {}
