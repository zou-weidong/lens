/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-object-list-layout.scss";

import React from "react";
import { computed, makeObservable, observable, reaction } from "mobx";
import { disposeOnUnmount, observer } from "mobx-react";
import type { Disposer } from "../../utils";
import { cssNames } from "../../utils";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { ItemListLayoutProps } from "../item-object-list/list-layout";
import { ItemListLayout } from "../item-object-list/list-layout";
import type { KubeObjectStore } from "../../../common/k8s-api/kube-object.store";
import { KubeObjectMenu } from "../kube-object-menu";
import { NamespaceSelectFilter } from "../+namespaces/namespace-select-filter";
import { Icon } from "../icon";
import { TooltipPosition } from "../tooltip";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { ClusterFrameContext } from "../../cluster-frame-context/cluster-frame-context";
import clusterFrameContextInjectable from "../../cluster-frame-context/cluster-frame-context.injectable";
import type { KubeWatchSubscribeStoreOptions } from "../../kube-watch-api/kube-watch-api";
import type { PageParam } from "../../navigation/page-param";
import type { ToggleDetails } from "../kube-object/details/toggle.injectable";
import kubeSelectedUrlParamInjectable from "../kube-object/details/selected.injectable";
import toggleDetailsInjectable from "../kube-object/details/toggle.injectable";
import subscribeStoresInjectable from "../../kube-watch-api/subscribe-stores.injectable";
import { resourceKindMap, resourceNames } from "../../../common/k8s/resources";

type ItemListLayoutPropsWithoutGetItems<K extends KubeObject> = Omit<ItemListLayoutProps<K>, "getItems">;

export interface KubeObjectListLayoutProps<K extends KubeObject> extends ItemListLayoutPropsWithoutGetItems<K> {
  items?: K[];
  getItems?: () => K[];
  store: KubeObjectStore<K>;
  dependentStores?: KubeObjectStore<KubeObject>[];
  subscribeStores?: boolean;
}

interface Dependencies {
  clusterFrameContext: ClusterFrameContext;
  subscribeToStores: (stores: KubeObjectStore<KubeObject>[], options: KubeWatchSubscribeStoreOptions) => Disposer;
  kubeSelectedUrlParam: PageParam<string>;
  toggleDetails: ToggleDetails;
}

@observer
class NonInjectedKubeObjectListLayout<K extends KubeObject> extends React.Component<KubeObjectListLayoutProps<K> & Dependencies> {
  constructor(props: KubeObjectListLayoutProps<K> & Dependencies) {
    super(props);
    makeObservable(this);
  }

  @observable loadErrors: string[] = [];

  @computed get selectedItem() {
    const { store, kubeSelectedUrlParam } = this.props;

    return store.getByPath(kubeSelectedUrlParam.get());
  }

  componentDidMount() {
    const { store, dependentStores = [], subscribeStores = true } = this.props;
    const stores = Array.from(new Set([store, ...dependentStores]));
    const reactions: Disposer[] = [
      reaction(() => this.props.clusterFrameContext.contextNamespaces.slice(), () => {
        // clear load errors
        this.loadErrors.length = 0;
      }),
    ];

    if (subscribeStores) {
      reactions.push(
        this.props.subscribeToStores(stores, {
          onLoadFailure: error => this.loadErrors.push(String(error)),
        }),
      );
    }

    disposeOnUnmount(this, reactions);
  }

  renderLoadErrors() {
    if (this.loadErrors.length === 0) {
      return null;
    }

    return (
      <Icon
        material="warning"
        className="load-error"
        tooltip={{
          children: (
            <>
              {this.loadErrors.map((error, index) => <p key={index}>{error}</p>)}
            </>
          ),
          preferredPositions: TooltipPosition.BOTTOM,
        }}
      />
    );
  }

  render() {
    const {
      className,
      customizeHeader,
      store,
      items,
      toggleDetails,
      onDetails = (item) => toggleDetails(item.selfLink),
      ...layoutProps
    } = this.props;
    const placeholderString = resourceNames[resourceKindMap[store.api.kind]] || store.api.kind;

    return (
      <ItemListLayout
        className={cssNames("KubeObjectListLayout", className)}
        store={store}
        getItems={() => this.props.items || store.contextItems}
        preloadStores={false} // loading handled in kubeWatchApi.subscribeStores()
        detailsItem={this.selectedItem}
        customizeHeader={[
          ({ filters, searchProps, info, ...headerPlaceHolders }) => ({
            filters: (
              <>
                {filters}
                {store.api.isNamespaced && <NamespaceSelectFilter />}
              </>
            ),
            searchProps: {
              ...searchProps,
              placeholder: `Search ${placeholderString}...`,
            },
            info: (
              <>
                {info}
                {this.renderLoadErrors()}
              </>
            ),
            ...headerPlaceHolders,
          }),
          ...[customizeHeader].flat(),
        ]}
        renderItemMenu={item => <KubeObjectMenu object={item} />}
        onDetails={onDetails}
        {...layoutProps}
      />
    );
  }
}

const InjectedKubeObjectListLayout = withInjectables<Dependencies, KubeObjectListLayoutProps<KubeObject>>(NonInjectedKubeObjectListLayout, {
  getProps: (di, props) => ({
    ...props,
    clusterFrameContext: di.inject(clusterFrameContextInjectable),
    subscribeToStores: di.inject(subscribeStoresInjectable),
    kubeSelectedUrlParam: di.inject(kubeSelectedUrlParamInjectable),
    toggleDetails: di.inject(toggleDetailsInjectable),
  }),
});

export function KubeObjectListLayout<K extends KubeObject>(props: KubeObjectListLayoutProps<K>) {
  return <InjectedKubeObjectListLayout {...props} />;
}
