/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import { nodesRoute, nodesURL } from "../../../common/routes";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";
import allowedResourcesInjectable from "../../clusters/allowed-resources.injectable";
import type { IsRouteActive } from "../../navigation/is-route-active.injectable";
import isRouteActiveInjectable from "../../navigation/is-route-active.injectable";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar/item";

export interface NodeSidebarItemProps {}

interface Dependencies {
  allowedResources: AllowedResources;
  isRouteActive: IsRouteActive;
}

const NonInjectedNodeSidebarItem = observer(({
  allowedResources,
  isRouteActive,
}: Dependencies & NodeSidebarItemProps) => (
  <SidebarItem
    id="nodes"
    text="Nodes"
    isActive={isRouteActive(nodesRoute)}
    isHidden={!allowedResources.has("nodes")}
    url={nodesURL()}
    icon={<Icon svg="nodes"/>}
  />
));

export const NodesSidebarItem = withInjectables<Dependencies, NodeSidebarItemProps>(NonInjectedNodeSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    allowedResources: di.inject(allowedResourcesInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
