/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import { clusterRoute, clusterURL } from "../../../common/routes";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";
import allowedResourcesInjectable from "../../clusters/allowed-resources.injectable";
import type { IsRouteActive } from "../../navigation/is-route-active.injectable";
import isRouteActiveInjectable from "../../navigation/is-route-active.injectable";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar/item";

export interface ClusterSidebarItemProps {}

interface Dependencies {
  allowedResources: AllowedResources;
  isRouteActive: IsRouteActive;
}

const NonInjectedClusterSidebarItem = observer(({
  allowedResources,
  isRouteActive,
}: Dependencies & ClusterSidebarItemProps) => (
  <SidebarItem
    id="cluster"
    text="Cluster"
    isActive={isRouteActive(clusterRoute)}
    isHidden={!allowedResources.has("nodes")}
    url={clusterURL()}
    icon={<Icon svg="kube"/>}
  />
));

export const ClusterSidebarItem = withInjectables<Dependencies, ClusterSidebarItemProps>(NonInjectedClusterSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    allowedResources: di.inject(allowedResourcesInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
