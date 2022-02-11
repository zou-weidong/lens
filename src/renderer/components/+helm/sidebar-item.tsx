/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar/item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import renderTabRoutesSidebarItemsInjectable, { RenderTabRoutesSidebarItems } from "../layout/render-tab-routes-sidebar-items.injectable";
import { helmRoute, helmURL } from "../../../common/routes";
import networkRouteTabsInjectable from "./route-tabs.injectable";
import isRouteActiveInjectable, { type IsRouteActive } from "../../navigation/is-route-active.injectable";

export interface HelmSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
  renderTabRoutesSidebarItems: RenderTabRoutesSidebarItems;
  isRouteActive: IsRouteActive;
}

const NonInjectedHelmSidebarItem = observer(({
  routes,
  renderTabRoutesSidebarItems,
  isRouteActive,
}: Dependencies & HelmSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="helm"
      text="Helm"
      isActive={isRouteActive(helmRoute)}
      url={helmURL()}
      icon={<Icon svg="helm" />}
    >
      {renderTabRoutesSidebarItems(tabRoutes)}
    </SidebarItem>
  );
});

export const HelmSidebarItem = withInjectables<Dependencies, HelmSidebarItemProps>(NonInjectedHelmSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    routes: di.inject(networkRouteTabsInjectable),
    renderTabRoutesSidebarItems: di.inject(renderTabRoutesSidebarItemsInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
