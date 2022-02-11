/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./hotbar-entity-icon.module.scss";

import type { HTMLAttributes } from "react";
import React from "react";
import type { IComputedValue } from "mobx";
import { makeObservable, observable } from "mobx";
import { observer } from "mobx-react";

import type { IClassName } from "../../utils";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import { HotbarIcon } from "./hotbar-icon";
import { LensKubernetesClusterStatus } from "../../../common/catalog/entity/declarations/kubernetes-cluster";
import type { CatalogEntity, CatalogEntityContextMenu } from "../../../common/catalog/entity";
import { withInjectables } from "@ogre-tools/injectable-react";
import activeEntityInjectable from "../../catalog/entity/active-entity.injectable";
import getCategoryForEntityInjectable from "../../../common/catalog/category/get-for-entity.injectable";
import type { OnContextMenuOpen } from "../../catalog/category/on-context-menu-open.injectable";
import onContextMenuOpenInjectable from "../../catalog/category/on-context-menu-open.injectable";
import type { GetCategoryForEntity } from "../../../common/catalog/category/registry.token";

export interface HotbarEntityIconProps extends HTMLAttributes<HTMLElement> {
  entity: CatalogEntity;
  index: number;
  errorClass?: IClassName;
  add: (item: CatalogEntity, index: number) => void;
  remove: (uid: string) => void;
  size?: number;
}

interface Dependencies {
  activeEntity: IComputedValue<CatalogEntity | undefined>;
  getCategoryForEntity: GetCategoryForEntity;
  onContextMenuOpen: OnContextMenuOpen;
}

@observer
class NonInjectedHotbarEntityIcon extends React.Component<HotbarEntityIconProps & Dependencies> {
  private readonly menuItems = observable.array<CatalogEntityContextMenu>();

  constructor(props: HotbarEntityIconProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get kindIcon() {
    const className = styles.badge;
    const category = this.props.getCategoryForEntity(this.props.entity);

    if (!category) {
      return <Icon material="bug_report" className={className} />;
    }

    return (
      <Icon
        className={className}
        {...Icon.convertProps(category.metadata.icon)}
      />
    );
  }

  get ledIcon() {
    if (this.props.entity.kind !== "KubernetesCluster") {
      return null;
    }

    const className = cssNames(styles.led, { [styles.online]: this.props.entity.status.phase === LensKubernetesClusterStatus.CONNECTED }); // TODO: make it more generic

    return <div className={className} />;
  }

  isActive(item: CatalogEntity) {
    return this.props.activeEntity.get()?.metadata?.uid == item.getId();
  }

  onMenuOpen() {
    this.menuItems.replace([{
      title: "Remove from Hotbar",
      onClick: () => this.props.remove(this.props.entity.getId()),
    }]);

    this.props.onContextMenuOpen(this.props.entity, this.menuItems);
  }

  render() {
    const { entity, errorClass, add, remove, index, children, ...elemProps } = this.props;

    return (
      <HotbarIcon
        uid={entity.getId()}
        title={entity.getName()}
        source={entity.metadata.source}
        src={entity.spec.icon?.src}
        material={entity.spec.icon?.material}
        background={entity.spec.icon?.background}
        className={this.props.className}
        active={this.isActive(entity)}
        onMenuOpen={() => this.onMenuOpen()}
        disabled={!entity}
        menuItems={this.menuItems}
        tooltip={`${entity.getName()} (${entity.metadata.source})`}
        {...elemProps}
      >
        { this.ledIcon }
        { this.kindIcon }
      </HotbarIcon>
    );
  }
}

export const HotbarEntityIcon = withInjectables<Dependencies, HotbarEntityIconProps>(NonInjectedHotbarEntityIcon, {
  getProps: (di, props) => ({
    ...props,
    activeEntity: di.inject(activeEntityInjectable),
    getCategoryForEntity: di.inject(getCategoryForEntityInjectable),
    onContextMenuOpen: di.inject(onContextMenuOpenInjectable),
  }),
});
