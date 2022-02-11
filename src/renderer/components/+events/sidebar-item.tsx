/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import { eventRoute, eventsURL } from "../../../common/routes";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";
import allowedResourcesInjectable from "../../clusters/allowed-resources.injectable";
import type { IsRouteActive } from "../../navigation/is-route-active.injectable";
import isRouteActiveInjectable from "../../navigation/is-route-active.injectable";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar/item";

export interface EventsSidebarItemProps {}

interface Dependencies {
  allowedResources: AllowedResources;
  isRouteActive: IsRouteActive;
}

const NonInjectedEventsSidebarItem = observer(({
  allowedResources,
  isRouteActive,
}: Dependencies & EventsSidebarItemProps) => (
  <SidebarItem
    id="events"
    text="Events"
    isActive={isRouteActive(eventRoute)}
    isHidden={!allowedResources.has("events")}
    url={eventsURL()}
    icon={<Icon material="access_time"/>}
  />
));

export const EventsSidebarItem = withInjectables<Dependencies, EventsSidebarItemProps>(NonInjectedEventsSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    allowedResources: di.inject(allowedResourcesInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
