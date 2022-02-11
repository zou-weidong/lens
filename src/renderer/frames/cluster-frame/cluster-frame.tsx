/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import React from "react";
import { makeObservable, computed } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import { Redirect, Route, Router, Switch } from "react-router";
import { UserManagementRoute } from "../../components/+user-management/route";
import { ConfirmDialog } from "../../components/confirm-dialog/view";
import { Events } from "../../components/+events/events";
import { DeploymentScaleDialog } from "../../components/+workloads-deployments/dialogs/scale/view";
import { CronJobTriggerDialog } from "../../components/+workloads-cronjobs/dialogs/trigger/view";
import { CustomResourcesRoute } from "../../components/+custom-resources/route";
import { ClusterPageRegistry, getExtensionPageUrl } from "../../../extensions/registries/page-registry";
import type { ClusterPageMenuRegistration } from "../../../extensions/registries";
import { ClusterPageMenuRegistry } from "../../../extensions/registries";
import { StatefulSetScaleDialog } from "../../components/+workloads-statefulsets/dialogs/scale/view";
import { ReplicaSetScaleDialog } from "../../components/+workloads-replicasets/dialogs/scale/view";
import { CommandContainer } from "../../components/command-palette/command-container";
import * as routes from "../../../common/routes";
import type { TabLayoutRoute } from "../../components/layout/tab-layout";
import { TabLayout } from "../../components/layout/tab-layout";
import { ErrorBoundary } from "../../components/error-boundary";
import { MainLayout } from "../../components/layout/main-layout";
import { KubeObjectDetails } from "../../components/kube-object-details";
import { KubeConfigDialog } from "../../components/kubeconfig-dialog";
import { Sidebar } from "../../components/layout/sidebar/sidebar";
import { Dock } from "../../components/dock";
import { NamespacesRoute } from "../../components/+namespaces/route";
import { NetworkRoute } from "../../components/+network/route";
import { NodesRoute } from "../../components/+nodes/route";
import { WorkloadsRoute } from "../../components/+workloads/route";
import { ConfigRoute } from "../../components/+config/route";
import { StorageRoute } from "../../components/+storage/route";
import { DeleteClusterDialog } from "../../components/delete-cluster-dialog";
import type { NamespaceStore } from "../../components/+namespaces/namespace-store/namespace.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable  from "../../components/+namespaces/namespace-store/namespace-store.injectable";
import type { ClusterId } from "../../../common/clusters/cluster-types";
import historyInjectable from "../../navigation/history.injectable";
import type { History } from "history";
import type { AllowedResources } from "../../clusters/allowed-resources.injectable";
import allowedResourcesInjectable from "../../clusters/allowed-resources.injectable";
import { HelmRoute } from "../../components/+helm/route";
import type { KubeResource } from "../../../common/k8s/resources";
import { ClusterOverview } from "../../components/+cluster/cluster-overview";
import { NotificationsList } from "../../components/notifications/list";
import { PortForwardDialog } from "../../components/+network-port-forwards/dialog/view";
import type { ErrorNotification } from "../../components/notifications/error.injectable";
import errorNotificationInjectable from "../../components/notifications/error.injectable";
import type { WatchLocation } from "../../ipc/history/helpers/watch-location.injectable";
import watchLocationInjectable from "../../ipc/history/helpers/watch-location.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import hostedClusterIdInjectable from "../../clusters/hosted-cluster-id.injectable";
import type { SubscribeStores } from "../../kube-watch-api/kube-watch-api";

interface Dependencies {
  history: History;
  namespaceStore: NamespaceStore;
  hostedClusterId: ClusterId;
  subscribeStores: SubscribeStores;
  allowedResources: AllowedResources;
  errorNotification: ErrorNotification;
  watchLocation: WatchLocation;
}

@observer
class NonInjectedClusterFrame extends React.Component<Dependencies> {
  static displayName = "ClusterFrame";

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    disposeOnUnmount(this, [
      this.props.subscribeStores([
        this.props.namespaceStore,
      ]),
      this.props.watchLocation(),
    ]);
  }

  @computed get startUrl() {
    const resources : KubeResource[] = ["events", "nodes", "pods"];

    return resources.every(x => this.props.allowedResources.has(x))
      ? routes.clusterURL()
      : routes.workloadsURL();
  }

  getTabLayoutRoutes(menuItem: ClusterPageMenuRegistration) {
    const routes: TabLayoutRoute[] = [];

    if (!menuItem.id) {
      return routes;
    }

    ClusterPageMenuRegistry.getInstance().getSubItems(menuItem).forEach((subMenu) => {
      const page = ClusterPageRegistry.getInstance().getByPageTarget(subMenu.target);

      if (page) {
        routes.push({
          routePath: page.url,
          url: getExtensionPageUrl(subMenu.target),
          title: subMenu.title,
          component: page.components.Page,
        });
      }
    });

    return routes;
  }

  renderExtensionTabLayoutRoutes() {
    return ClusterPageMenuRegistry.getInstance().getRootItems().map((menu, index) => {
      const tabRoutes = this.getTabLayoutRoutes(menu);

      if (tabRoutes.length > 0) {
        const pageComponent = () => <TabLayout tabs={tabRoutes}/>;

        return <Route key={`extension-tab-layout-route-${index}`} component={pageComponent} path={tabRoutes.map((tab) => tab.routePath)}/>;
      } else {
        const page = ClusterPageRegistry.getInstance().getByPageTarget(menu.target);

        if (page) {
          return <Route key={`extension-tab-layout-route-${index}`} path={page.url} component={page.components.Page}/>;
        }
      }

      return null;
    });
  }

  renderExtensionRoutes() {
    return ClusterPageRegistry.getInstance().getItems().map((page, index) => {
      const menu = ClusterPageMenuRegistry.getInstance().getByPage(page);

      if (!menu) {
        return <Route key={`extension-route-${index}`} path={page.url} component={page.components.Page}/>;
      }

      return null;
    });
  }

  render() {
    return (
      <Router history={this.props.history}>
        <ErrorBoundary>
          <MainLayout sidebar={<Sidebar />} footer={<Dock />}>
            <Switch>
              <Route component={ClusterOverview} {...routes.clusterRoute}/>
              <Route component={NodesRoute} {...routes.nodesRoute}/>
              <Route component={WorkloadsRoute} {...routes.workloadsRoute}/>
              <Route component={ConfigRoute} {...routes.configRoute}/>
              <Route component={NetworkRoute} {...routes.networkRoute}/>
              <Route component={StorageRoute} {...routes.storageRoute}/>
              <Route component={NamespacesRoute} {...routes.namespacesRoute}/>
              <Route component={Events} {...routes.eventRoute}/>
              <Route component={CustomResourcesRoute} {...routes.crdRoute}/>
              <Route component={UserManagementRoute} {...routes.usersManagementRoute}/>
              <Route component={HelmRoute} {...routes.helmRoute}/>
              {this.renderExtensionTabLayoutRoutes()}
              {this.renderExtensionRoutes()}
              <Redirect exact from="/" to={this.startUrl}/>

              <Route render={({ location }) => {
                this.props.errorNotification(`Unknown location ${location.pathname}, redirecting to main page.`);

                return <Redirect to={this.startUrl} />;
              }} />

            </Switch>
          </MainLayout>
          <NotificationsList/>
          <ConfirmDialog/>
          <KubeObjectDetails/>
          <KubeConfigDialog/>
          <DeploymentScaleDialog/>
          <StatefulSetScaleDialog/>
          <ReplicaSetScaleDialog/>
          <CronJobTriggerDialog/>
          <PortForwardDialog/>
          <DeleteClusterDialog/>
          <CommandContainer clusterId={this.props.hostedClusterId}/>
        </ErrorBoundary>
      </Router>
    );
  }
}

export const ClusterFrame = withInjectables<Dependencies>(NonInjectedClusterFrame, {
  getProps: di => ({
    history: di.inject(historyInjectable),
    namespaceStore: di.inject(namespaceStoreInjectable),
    hostedClusterId: di.inject(hostedClusterIdInjectable),
    subscribeStores: di.inject(subscribeStoresInjectable),
    allowedResources: di.inject(allowedResourcesInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    watchLocation: di.inject(watchLocationInjectable),
  }),
});
