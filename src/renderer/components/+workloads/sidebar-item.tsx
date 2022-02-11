/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import { workloadsRoute, workloadsURL } from "../../../common/routes";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar/item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import workloadsRouteTabsInjectable from "./route-tabs.injectable";
import isRouteActiveInjectable, { type IsRouteActive } from "../../navigation/is-route-active.injectable";
import renderTabRoutesSidebarItemsInjectable, { type RenderTabRoutesSidebarItems } from "../layout/render-tab-routes-sidebar-items.injectable";

export interface WorkloadSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
  renderTabRoutesSidebarItems: RenderTabRoutesSidebarItems;
  isRouteActive: IsRouteActive;
}

const NonInjectedWorkloadsSidebarItem = observer(({
  routes,
  renderTabRoutesSidebarItems,
  isRouteActive,
}: Dependencies & WorkloadSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="workloads"
      text="Workloads"
      isActive={isRouteActive(workloadsRoute)}
      isHidden={tabRoutes.length == 0}
      url={workloadsURL()}
      icon={<Icon svg="workloads"/>}
    >
      {renderTabRoutesSidebarItems(tabRoutes)}
    </SidebarItem>
  );
});

export const WorkloadsSidebarItem = withInjectables<Dependencies, WorkloadSidebarItemProps>(NonInjectedWorkloadsSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    routes: di.inject(workloadsRouteTabsInjectable),
    renderTabRoutesSidebarItems: di.inject(renderTabRoutesSidebarItemsInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
