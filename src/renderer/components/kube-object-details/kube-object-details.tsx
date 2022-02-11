/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./kube-object-details.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { computed, observable, reaction, makeObservable } from "mobx";
import { Drawer } from "../drawer";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import { Spinner } from "../spinner";
import type { CustomResourceDefinitionStore } from "../+custom-resources/definitions/store";
import { KubeObjectMenu } from "../kube-object-menu";
import { KubeObjectDetailRegistry } from "../../api/kube-object-detail-registry";
import { CustomResourceDetails } from "../+custom-resources";
import { KubeObjectMeta } from "../kube-object-meta";
import type { ShowDetails } from "../kube-object/details/show.injectable";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { HideDetails } from "../kube-object/details/hide.injectable";
import hideDetailsInjectable from "../kube-object/details/hide.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import showDetailsInjectable from "../kube-object/details/show.injectable";
import type { PageParam } from "../../navigation/page-param";
import kubeSelectedUrlParamInjectable from "../kube-object/details/selected.injectable";
import customResourceDefinitionStoreInjectable from "../+custom-resources/definitions/store.injectable";


export interface KubeObjectDetailsProps<T extends KubeObject = KubeObject> {
  className?: string;
  object: T;
}

interface Dependencies {
  showDetails: ShowDetails;
  hideDetails: HideDetails;
  apiManager: ApiManager;
  kubeSelectedUrlParam: PageParam<string>;
  customResourceDefinitionStore: CustomResourceDefinitionStore;
}

@observer
class NonInjectedKubeObjectDetails extends React.Component<Dependencies> {
  @observable isLoading = false;
  @observable.ref loadingError: React.ReactNode;

  constructor(props: Dependencies) {
    super(props);
    makeObservable(this);
  }

  @computed get path() {
    return this.props.kubeSelectedUrlParam.get();
  }

  @computed get object() {
    const { apiManager } = this.props;

    try {
      return apiManager
        .getStore(this.path)
        ?.getByPath(this.path);
    } catch (error) {
      console.error(`[KUBE-OBJECT-DETAILS]: failed to get store or object: ${error}`, { path: this.path });

      return undefined;
    }
  }

  componentDidMount(): void {
    disposeOnUnmount(this, [
      reaction(() => [
        this.path,
        this.object, // resource might be updated via watch-event or from already opened details
        this.props.customResourceDefinitionStore.items.length, // crd stores initialized after loading
      ], async () => {
        this.loadingError = "";
        const { apiManager } = this.props;
        const { path, object } = this;

        if (!object) {
          const store = apiManager.getStore(path);

          if (store) {
            this.isLoading = true;

            try {
              await store.loadFromPath(path);
            } catch (err) {
              this.loadingError = <>Resource loading has failed: <b>{err.toString()}</b></>;
            } finally {
              this.isLoading = false;
            }
          }
        }
      }),
    ]);
  }

  render() {
    const { object, isLoading, loadingError } = this;
    const { hideDetails } = this.props;
    const isOpen = !!(object || isLoading || loadingError);

    if (!object) {
      return (
        <Drawer
          className="KubeObjectDetails flex column"
          open={isOpen}
          title=""
          toolbar={<KubeObjectMenu object={object} toolbar={true} />}
          onClose={hideDetails}
        >
          {isLoading && <Spinner center />}
          {loadingError && <div className="box center">{loadingError}</div>}
        </Drawer>
      );
    }

    const { kind, getName } = object;
    const title = `${kind}: ${getName()}`;
    const details = KubeObjectDetailRegistry
      .getInstance()
      .getItemsForKind(object.kind, object.apiVersion)
      .map((item, index) => (
        <item.components.Details object={object} key={`object-details-${index}`} />
      ));

    if (details.length === 0) {
      const crd = this.props.customResourceDefinitionStore.getByObject(object);

      /**
       * This is a fallback so that if a custom resource object doesn't have
       * any defined details we should try and display at least some details
       */
      if (crd) {
        details.push(<CustomResourceDetails key={object.getId()} object={object} crd={crd} />);
      }
    }

    if (details.length === 0) {
      // if we still don't have any details to show, just show the standard object metadata
      details.push(<KubeObjectMeta key={object.getId()} object={object} />);
    }

    return (
      <Drawer
        className="KubeObjectDetails flex column"
        open={isOpen}
        title={title}
        toolbar={<KubeObjectMenu object={object} toolbar={true}/>}
        onClose={hideDetails}
      >
        {isLoading && <Spinner center/>}
        {loadingError && <div className="box center">{loadingError}</div>}
        {details}
      </Drawer>
    );
  }
}

export const KubeObjectDetails = withInjectables<Dependencies>(NonInjectedKubeObjectDetails, {
  getProps: (di, props) => ({
    ...props,
    hideDetails: di.inject(hideDetailsInjectable),
    apiManager: di.inject(apiManagerInjectable),
    showDetails: di.inject(showDetailsInjectable),
    kubeSelectedUrlParam: di.inject(kubeSelectedUrlParamInjectable),
    customResourceDefinitionStore: di.inject(customResourceDefinitionStoreInjectable),
  }),
});
