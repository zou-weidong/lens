/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { configRoute, configURL } from "../../../common/routes";
import type { IsRouteActive } from "../../navigation/is-route-active.injectable";
import isRouteActiveInjectable from "../../navigation/is-route-active.injectable";
import { Icon } from "../icon";
import type { RenderTabRoutesSidebarItems } from "../layout/render-tab-routes-sidebar-items.injectable";
import renderTabRoutesSidebarItemsInjectable from "../layout/render-tab-routes-sidebar-items.injectable";
import { SidebarItem } from "../layout/sidebar/item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import configRoutesInjectable from "./route-tabs.injectable";

export interface ConfigSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
  renderTabRoutesSidebarItems: RenderTabRoutesSidebarItems;
  isRouteActive: IsRouteActive;
}

const NonInjectedConfigSidebarItem = observer(({
  routes,
  isRouteActive,
  renderTabRoutesSidebarItems,
}: Dependencies & ConfigSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="config"
      text="Configuration"
      isActive={isRouteActive(configRoute)}
      isHidden={tabRoutes.length == 0}
      url={configURL()}
      icon={<Icon material="list"/>}
    >
      {renderTabRoutesSidebarItems(tabRoutes)}
    </SidebarItem>
  );
});

export const ConfigSidebarItem = withInjectables<Dependencies, ConfigSidebarItemProps>(NonInjectedConfigSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    routes: di.inject(configRoutesInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
    renderTabRoutesSidebarItems: di.inject(renderTabRoutesSidebarItemsInjectable),
  }),
});
