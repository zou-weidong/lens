/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import { cssNames } from "../../utils";
import type { MenuActionsProps } from "../menu/menu-actions";
import { MenuActions } from "../menu/menu-actions";
import { observer } from "mobx-react";
import { makeObservable, observable } from "mobx";
import { Icon } from "../icon";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import type { CatalogEntity, CatalogEntityContextMenu } from "../../../common/catalog/entity";
import type { OnContextMenuOpen } from "../../catalog/category/on-context-menu-open.injectable";
import { withInjectables } from "@ogre-tools/injectable-react";
import onContextMenuOpenInjectable from "../../catalog/category/on-context-menu-open.injectable";
import { ContextMenu } from "../menu/context";

export interface CatalogEntityDrawerMenuProps<T extends CatalogEntity> extends MenuActionsProps {
  entity: T;
}

interface Dependencies {
  onContextMenuOpen: OnContextMenuOpen;
}

@observer
class NonInjectedCatalogEntityDrawerMenu<T extends CatalogEntity> extends React.Component<CatalogEntityDrawerMenuProps<T> & Dependencies> {
  private readonly menuItems = observable.array<CatalogEntityContextMenu>();

  constructor(props: CatalogEntityDrawerMenuProps<T> & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.props.onContextMenuOpen(this.props.entity, this.menuItems);
  }

  render() {
    const { className, entity, ...menuProps } = this.props;

    if (!entity.isEnabled()) {
      return null;
    }

    return (
      <MenuActions
        className={cssNames("CatalogEntityDrawerMenu", className)}
        toolbar
        {...menuProps}
      >
        <ContextMenu
          menuItems={this.menuItems}
          toolbar
        />
        <HotbarToggleMenuItem
          key="hotbar-toggle"
          entity={entity}
          addContent={<Icon material="push_pin" interactive small tooltip="Add to Hotbar"/>}
          removeContent={<Icon svg="push_off" interactive small tooltip="Remove from Hotbar"/>}
        />,
      </MenuActions>
    );
  }
}

const InjectedCatalogEntityDrawerMenu = withInjectables<Dependencies, CatalogEntityDrawerMenuProps<CatalogEntity>>(NonInjectedCatalogEntityDrawerMenu, {
  getProps: (di, props) => ({
    ...props,
    onContextMenuOpen: di.inject(onContextMenuOpenInjectable),
  }),
});

export function CatalogEntityDrawerMenu<T extends CatalogEntity>(props: CatalogEntityDrawerMenuProps<T>) {
  return <InjectedCatalogEntityDrawerMenu {...props} />;
}
