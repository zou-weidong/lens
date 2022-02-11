/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { withInjectables } from "@ogre-tools/injectable-react";
import { observer } from "mobx-react";
import React from "react";
import { namespacesRoute, namespacesURL } from "../../../common/routes";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";
import allowedResourcesInjectable from "../../clusters/allowed-resources.injectable";
import type { IsRouteActive } from "../../navigation/is-route-active.injectable";
import isRouteActiveInjectable from "../../navigation/is-route-active.injectable";
import { Icon } from "../icon";
import { SidebarItem } from "../layout/sidebar/item";

export interface NamespacesSidebarItemProps {}

interface Dependencies {
  allowedResources: AllowedResources;
  isRouteActive: IsRouteActive;
}

const NonInjectedNamespacesSidebarItem = observer(({
  allowedResources,
  isRouteActive,
}: Dependencies & NamespacesSidebarItemProps) => (
  <SidebarItem
    id="namespaces"
    text="Namespaces"
    isActive={isRouteActive(namespacesRoute)}
    isHidden={!allowedResources.has("namespaces")}
    url={namespacesURL()}
    icon={<Icon material="layers"/>}
  />
));

export const NamespacesSidebarItem = withInjectables<Dependencies, NamespacesSidebarItemProps>(NonInjectedNamespacesSidebarItem, {
  getProps: (di, props) => ({
    ...props,
    allowedResources: di.inject(allowedResourcesInjectable),
    isRouteActive: di.inject(isRouteActiveInjectable),
  }),
});
