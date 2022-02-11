/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { TabLayoutRoute } from "../layout/tab-layout";
import { Services } from "../+network-services";
import { Endpoints } from "../+network-endpoints";
import { Ingresses } from "../+network-ingresses";
import { NetworkPolicies } from "../+network-policies";
import { PortForwards } from "../+network-port-forwards";
import * as routes from "../../../common/routes";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";
import allowedResourcesInjectable from "../../clusters/allowed-resources.injectable";

interface Dependencies {
  allowedResources: AllowedResources;
}

function getRouteTabs({ allowedResources }: Dependencies) {
  return computed(() => {
    const tabs: TabLayoutRoute[] = [];

    if (allowedResources.has("services")) {
      tabs.push({
        title: "Services",
        component: Services,
        url: routes.servicesURL(),
        routePath: routes.servicesRoute.path.toString(),
      });
    }

    if (allowedResources.has("endpoints")) {
      tabs.push({
        title: "Endpoints",
        component: Endpoints,
        url: routes.endpointURL(),
        routePath: routes.endpointRoute.path.toString(),
      });
    }

    if (allowedResources.has("ingresses")) {
      tabs.push({
        title: "Ingresses",
        component: Ingresses,
        url: routes.ingressURL(),
        routePath: routes.ingressRoute.path.toString(),
      });
    }

    if (allowedResources.has("networkpolicies")) {
      tabs.push({
        title: "Network Policies",
        component: NetworkPolicies,
        url: routes.networkPoliciesURL(),
        routePath: routes.networkPoliciesRoute.path.toString(),
      });
    }

    tabs.push({
      title: "Port Forwarding",
      component: PortForwards,
      url: routes.portForwardsURL(),
      routePath: routes.portForwardsRoute.path.toString(),
    });

    return tabs;
  });
}

const networkRouteTabsInjectable = getInjectable({
  id: "network-route-tabs",

  instantiate: (di) => getRouteTabs({
    allowedResources: di.inject(allowedResourcesInjectable),
  }),
});

export default networkRouteTabsInjectable;
