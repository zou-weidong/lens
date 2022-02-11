/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./cluster.module.scss";

import type { IComputedValue } from "mobx";
import { observable } from "mobx";
import React, { useState } from "react";
import { Avatar } from "../../avatar";
import { Icon } from "../../icon";
import { Menu } from "../../menu";
import { Tooltip } from "../../tooltip";
import { SidebarClusterLoading } from "./cluster-loading";
import { observer } from "mobx-react";
import { withInjectables } from "@ogre-tools/injectable-react";
import activeEntityInjectable from "../../../catalog/entity/active-entity.injectable";
import type { CatalogEntityContextMenu, CatalogEntity } from "../../../../common/catalog/entity";
import type { Hotbar } from "../../../../common/hotbars/hotbar";
import activeHotbarInjectable from "../../../../common/hotbars/active-hotbar.injectable";
import type { OnContextMenuOpen } from "../../../catalog/category/on-context-menu-open.injectable";
import onContextMenuOpenInjectable from "../../../catalog/category/on-context-menu-open.injectable";
import { ContextMenu } from "../../menu/context";

export interface SidebarClusterProps {
}

interface Dependencies {
  entity: IComputedValue<CatalogEntity | null | undefined>;
  activeHotbar: IComputedValue<Hotbar>;
  onContextMenuOpen: OnContextMenuOpen;
}

const NonInjectedSidebarCluster = observer(({
  entity,
  activeHotbar,
  onContextMenuOpen,
}: Dependencies & SidebarClusterProps) => {
  const [opened, setOpened] = useState(false);
  const [menuItems] = useState(observable.array<CatalogEntityContextMenu>());
  const clusterEntity = entity.get();
  const hotbar = activeHotbar.get();

  if (!clusterEntity) {
    return <SidebarClusterLoading />;
  }

  const onMenuOpen = () => {
    const isAddedToActive = hotbar.has(clusterEntity);
    const [title, onClick] = isAddedToActive
      ? [
        "Remove from Hotbar",
        () => hotbar.remove(clusterEntity.getId()),
      ]
      : [
        "Add to Hotbar",
        () => hotbar.add(clusterEntity),
      ];

    menuItems.replace([{ title, onClick }]);
    onContextMenuOpen(clusterEntity, menuItems);
    toggle();
  };

  const onKeyDown = (evt: React.KeyboardEvent<HTMLDivElement>) => {
    if (evt.code == "Space") {
      toggle();
    }
  };

  const toggle = () => {
    setOpened(!opened);
  };

  const id = `cluster-${clusterEntity.getId()}`;
  const tooltipId = `tooltip-${id}`;

  return (
    <div
      id={id}
      className={styles.SidebarCluster}
      tabIndex={0}
      onKeyDown={onKeyDown}
      role="menubar"
      data-testid="sidebar-cluster-dropdown"
    >
      <Avatar
        title={clusterEntity.getName()}
        colorHash={`${clusterEntity.getName()}-${clusterEntity.metadata.source}`}
        size={40}
        src={clusterEntity.spec.icon?.src}
        className={styles.avatar}
      />
      <div className={styles.clusterName} id={tooltipId}>
        {clusterEntity.getName()}
      </div>
      <Tooltip targetId={tooltipId}>
        {clusterEntity.getName()}
      </Tooltip>
      <Icon material="arrow_drop_down" className={styles.dropdown}/>
      <Menu
        usePortal
        htmlFor={id}
        isOpen={opened}
        open={onMenuOpen}
        closeOnClickItem
        closeOnClickOutside
        close={toggle}
        className={styles.menu}
      >
        <ContextMenu menuItems={menuItems} />
      </Menu>
    </div>
  );
});

export const SidebarCluster = withInjectables<Dependencies, SidebarClusterProps>(NonInjectedSidebarCluster, {
  getProps: (di, props) => ({
    ...props,
    entity: di.inject(activeEntityInjectable),
    activeHotbar: di.inject(activeHotbarInjectable),
    onContextMenuOpen: di.inject(onContextMenuOpenInjectable),
  }),
});
