/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { usersManagementRoute, usersManagementURL } from "../../../common/routes";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar/item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import renderTabRoutesSidebarItemsInjectable, { type RenderTabRoutesSidebarItems } from "../layout/render-tab-routes-sidebar-items.injectable";
import userManagementRouteTabsInjectable from "./route-tabs.injectable";
import type { IsRouteActive } from "../../navigation/is-route-active.injectable";
import isRouteActiveInjectable from "../../navigation/is-route-active.injectable";

export interface UserManagementSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
  renderTabRoutesSidebarItems: RenderTabRoutesSidebarItems;
  isRouteActive: IsRouteActive;
}

const NonInjectedUserManagementSidebarItem = observer(({
  routes,
  renderTabRoutesSidebarItems,
  isRouteActive,
}: Dependencies & UserManagementSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="users"
      text="Access Control"
      isActive={isRouteActive(usersManagementRoute)}
      isHidden={tabRoutes.length === 0}
      url={usersManagementURL()}
      icon={<Icon material="security"/>}
    >
      {renderTabRoutesSidebarItems(tabRoutes)}
    </SidebarItem>
  );
});

export const UserManagementSidebarItem = withInjectables<Dependencies, UserManagementSidebarItemProps>(NonInjectedUserManagementSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    routes: di.inject(userManagementRouteTabsInjectable),
    renderTabRoutesSidebarItems: di.inject(renderTabRoutesSidebarItemsInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
