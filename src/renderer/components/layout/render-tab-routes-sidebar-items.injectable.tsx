/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { SidebarItem } from "./sidebar/item";
import type { TabLayoutRoute } from "./tab-layout";
import { getInjectable } from "@ogre-tools/injectable";
import type { IsRouteActive } from "../../navigation/is-route-active.injectable";
import isRouteActiveInjectable from "../../navigation/is-route-active.injectable";

function withId(src: TabLayoutRoute) {
  return {
    ...src,
    id: `tab-route-item-${src.url ?? src.routePath}`,
  };
}

export type RenderTabRoutesSidebarItems = (routes: TabLayoutRoute[]) => JSX.Element[];

interface Dependencies {
  isRouteActive: IsRouteActive;
}

/**
 * Renders a sidebar item for each route
 *
 * NOTE: this cannot be a component because then the `<SidebarItem>.isExandable`
 * check will always return true because a component that renders to `null` is
 * still a present child to the parent `<SidebarItem>`
 */
const renderTabRoutesSidebarItems = ({
  isRouteActive,
}: Dependencies): RenderTabRoutesSidebarItems => (
  (routes) => (
    routes
      .map(withId)
      .map(({ title, routePath, url = routePath, exact = true, id }) => (
        <SidebarItem
          key={id}
          id={id}
          url={url}
          text={title}
          isActive={isRouteActive({ path: routePath, exact })}
        />
      ))
  )
);

const renderTabRoutesSidebarItemsInjectable = getInjectable({
  id: "render-tab-routes-sidebar-items",
  instantiate: (di) => renderTabRoutesSidebarItems({
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});

export default renderTabRoutesSidebarItemsInjectable;

