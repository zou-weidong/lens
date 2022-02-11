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
import { networkRoute, networkURL } from "../../../common/routes";
import networkRouteTabsInjectable from "./route-tabs.injectable";
import isRouteActiveInjectable, { type IsRouteActive } from "../../navigation/is-route-active.injectable";
import renderTabRoutesSidebarItemsInjectable, { type RenderTabRoutesSidebarItems } from "../layout/render-tab-routes-sidebar-items.injectable";

export interface NetworkSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
  renderTabRoutesSidebarItems: RenderTabRoutesSidebarItems;
  isRouteActive: IsRouteActive;
}

const NonInjectedNetworkSidebarItem = observer(({
  routes,
  renderTabRoutesSidebarItems,
  isRouteActive,
}: Dependencies & NetworkSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="networks"
      text="Network"
      isActive={isRouteActive(networkRoute)}
      isHidden={tabRoutes.length == 0}
      url={networkURL()}
      icon={<Icon material="device_hub"/>}
    >
      {renderTabRoutesSidebarItems(tabRoutes)}
    </SidebarItem>
  );
});

export const NetworkSidebarItem = withInjectables<Dependencies, NetworkSidebarItemProps>(NonInjectedNetworkSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    routes: di.inject(networkRouteTabsInjectable),
    renderTabRoutesSidebarItems: di.inject(renderTabRoutesSidebarItemsInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
