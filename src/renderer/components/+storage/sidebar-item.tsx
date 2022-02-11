/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import type { IComputedValue } from "mobx";
import { observer } from "mobx-react";
import React from "react";
import { storageRoute, storageURL } from "../../../common/routes";
import isRouteActiveInjectable, { type IsRouteActive } from "../../navigation/is-route-active.injectable";
import { Icon } from "../icon";
import renderTabRoutesSidebarItemsInjectable, { type RenderTabRoutesSidebarItems } from "../layout/render-tab-routes-sidebar-items.injectable";
import { SidebarItem } from "../layout/sidebar/item";
import type { TabLayoutRoute } from "../layout/tab-layout";
import storageRouteTabsInjectable from "./route-tabs.injectable";

export interface StorageSidebarItemProps {}

interface Dependencies {
  routes: IComputedValue<TabLayoutRoute[]>;
  renderTabRoutesSidebarItems: RenderTabRoutesSidebarItems;
  isRouteActive: IsRouteActive;
}

const NonInjectedStorageSidebarItem = observer(({
  routes,
  renderTabRoutesSidebarItems,
  isRouteActive,
}: Dependencies & StorageSidebarItemProps) => {
  const tabRoutes = routes.get();

  return (
    <SidebarItem
      id="storage"
      text="Storage"
      isActive={isRouteActive(storageRoute)}
      isHidden={tabRoutes.length == 0}
      url={storageURL()}
      icon={<Icon svg="storage"/>}
    >
      {renderTabRoutesSidebarItems(tabRoutes)}
    </SidebarItem>
  );
});

export const StorageSidebarItem = withInjectables<Dependencies, StorageSidebarItemProps>(NonInjectedStorageSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    routes: di.inject(storageRouteTabsInjectable),
    renderTabRoutesSidebarItems: di.inject(renderTabRoutesSidebarItemsInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
