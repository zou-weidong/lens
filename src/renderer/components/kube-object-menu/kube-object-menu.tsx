/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { boundMethod, cssNames } from "../../utils";
import type { KubeObject } from "../../../common/k8s-api/kube-object";
import type { MenuActionsProps } from "../menu";
import { MenuActions } from "../menu";
import identity from "lodash/identity";
import type { ApiManager } from "../../../common/k8s-api/api-manager";
import { withInjectables } from "@ogre-tools/injectable-react";
import createEditResourceTabInjectable from "../dock/edit-resource/edit-resource-tab.injectable";
import kubeObjectMenuItemsInjectable from "./items.injectable";
import apiManagerInjectable from "../../../common/k8s-api/api-manager.injectable";
import hostedClusterInjectable from "../../clusters/hosted-cluster.injectable";
import type { Cluster } from "../../../common/clusters/cluster";
import hideDetailsInjectable from "../kube-object/details/hide.injectable";
import type { KubeObjectMenuItemProps } from "./registration";

export interface KubeObjectMenuProps<TKubeObject extends KubeObject> extends MenuActionsProps {
  object: TKubeObject | null | undefined;
  editable?: boolean;
  removable?: boolean;
}

interface Dependencies {
  apiManager: ApiManager;
  kubeObjectMenuItems: React.ComponentType<KubeObjectMenuItemProps>[];
  cluster: Cluster;
  hideDetails: () => void;
  createEditResourceTab: (kubeObject: KubeObject) => void;
}

class NonInjectedKubeObjectMenu<TKubeObject extends KubeObject> extends React.Component<KubeObjectMenuProps<TKubeObject> & Dependencies> {

  get store() {
    const { object } = this.props;

    if (!object) return null;

    return this.props.apiManager.getStore(object.selfLink);
  }

  get isEditable() {
    return this.props.editable ?? Boolean(this.store?.patch);
  }

  get isRemovable() {
    return this.props.removable ?? Boolean(this.store?.remove);
  }

  @boundMethod
  async update() {
    this.props.hideDetails();
    this.props.createEditResourceTab(this.props.object);
  }

  @boundMethod
  async remove() {
    this.props.hideDetails();
    const { object, removeAction } = this.props;

    if (removeAction) await removeAction();
    else await this.store.remove(object);
  }

  @boundMethod
  renderRemoveMessage() {
    const { object } = this.props;

    if (!object) {
      return null;
    }

    const breadcrumbParts = [object.getNs(), object.getName()];

    const breadcrumb = breadcrumbParts.filter(identity).join("/");

    return (
      <p>
        Remove {object.kind} <b>{breadcrumb}</b> from <b>{this.props.cluster.name}</b>?
      </p>
    );
  }

  getMenuItems(): React.ReactChild[] {
    const { object, toolbar } = this.props;

    return this.props.kubeObjectMenuItems.map((MenuItem, index) => (
      <MenuItem object={object} toolbar={toolbar} key={`menu-item-${index}`} />
    ));
  }

  render() {
    const { remove, update, renderRemoveMessage, isEditable, isRemovable } = this;
    const { className, editable, removable, ...menuProps } = this.props;

    return (
      <MenuActions
        className={cssNames("KubeObjectMenu", className)}
        updateAction={isEditable ? update : undefined}
        removeAction={isRemovable ? remove : undefined}
        removeConfirmationMessage={renderRemoveMessage}
        {...menuProps}
      >
        {this.getMenuItems()}
      </MenuActions>
    );
  }
}

const InjectedKubeObjectMenu = withInjectables<Dependencies, KubeObjectMenuProps<KubeObject>>(NonInjectedKubeObjectMenu, {
  getProps: (di, props) => ({
    ...props,
    cluster: di.inject(hostedClusterInjectable),
    apiManager: di.inject(apiManagerInjectable),
    createEditResourceTab: di.inject(createEditResourceTabInjectable),
    hideDetails: di.inject(hideDetailsInjectable),
    kubeObjectMenuItems: di.inject(kubeObjectMenuItemsInjectable, {
      kubeObject: props.object,
    }),
  }),
});

export function KubeObjectMenu<T extends KubeObject>(props: KubeObjectMenuProps<T>) {
  return <InjectedKubeObjectMenu {...props} />;
}
