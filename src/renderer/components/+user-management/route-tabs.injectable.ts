/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { computed } from "mobx";
import type { TabLayoutRoute } from "../layout/tab-layout";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";
import allowedResourcesInjectable from "../../clusters/allowed-resources.injectable";
import * as routes from "../../../common/routes";
import { PodSecurityPolicies } from "../+pod-security-policies";
import { ClusterRoleBindings } from "./+cluster-role-bindings";
import { ClusterRoles } from "./+cluster-roles";
import { RoleBindings } from "./+role-bindings";
import { Roles } from "./+roles";
import { ServiceAccounts } from "./+service-accounts";

interface Dependencies {
  allowedResources: AllowedResources;
}

function getRouteTabs({ allowedResources }: Dependencies) {
  return computed(() => {
    const tabs: TabLayoutRoute[] = [];

    if (allowedResources.has("serviceaccounts")) {
      tabs.push({
        title: "Service Accounts",
        component: ServiceAccounts,
        url: routes.serviceAccountsURL(),
        routePath: routes.serviceAccountsRoute.path.toString(),
      });
    }

    if (allowedResources.has("clusterroles")) {
      tabs.push({
        title: "Cluster Roles",
        component: ClusterRoles,
        url: routes.clusterRolesURL(),
        routePath: routes.clusterRolesRoute.path.toString(),
      });
    }

    if (allowedResources.has("roles")) {
      tabs.push({
        title: "Roles",
        component: Roles,
        url: routes.rolesURL(),
        routePath: routes.rolesRoute.path.toString(),
      });
    }

    if (allowedResources.has("clusterrolebindings")) {
      tabs.push({
        title: "Cluster Role Bindings",
        component: ClusterRoleBindings,
        url: routes.clusterRoleBindingsURL(),
        routePath: routes.clusterRoleBindingsRoute.path.toString(),
      });
    }

    if (allowedResources.has("rolebindings")) {
      tabs.push({
        title: "Role Bindings",
        component: RoleBindings,
        url: routes.roleBindingsURL(),
        routePath: routes.roleBindingsRoute.path.toString(),
      });
    }

    if (allowedResources.has("podsecuritypolicies")) {
      tabs.push({
        title: "Pod Security Policies",
        component: PodSecurityPolicies,
        url: routes.podSecurityPoliciesURL(),
        routePath: routes.podSecurityPoliciesRoute.path.toString(),
      });
    }

    return tabs;
  });
}

const userManagementRouteTabsInjectable = getInjectable({
  instantiate: (di) => getRouteTabs({
    allowedResources: di.inject(allowedResourcesInjectable),
  }),
  id: "user-management-route-tabs",
});

export default userManagementRouteTabsInjectable;
