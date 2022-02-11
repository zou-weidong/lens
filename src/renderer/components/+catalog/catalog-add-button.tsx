/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./catalog-add-button.scss";
import React from "react";
import { SpeedDial, SpeedDialAction } from "@material-ui/lab";
import { Icon } from "../icon";
import { observer } from "mobx-react";
import { observable, makeObservable, action } from "mobx";
import { boundMethod, getOrInsert } from "../../../common/utils";
import type { CatalogCategoryRegistry } from "../../catalog/category/registry";
import type { CatalogCategory } from "../../../common/catalog/category";
import type { CatalogEntityAddMenu } from "../../../extensions/common-api/catalog";
import { withInjectables } from "@ogre-tools/injectable-react";
import type { OnCatalogAddMenu } from "../../catalog/category/on-catalog-add-menu.injectable";
import onCatalogAddMenuInjectable from "../../catalog/category/on-catalog-add-menu.injectable";
import catalogCategoryRegistryInjectable from "../../catalog/category/registry.injectable";

export interface CatalogAddButtonProps {
  category: CatalogCategory;
}

type CategoryId = string;

interface Dependencies {
  categoryRegistry: CatalogCategoryRegistry;
  onCatalogAddMenu: OnCatalogAddMenu;
}

@observer
class NonInjectedCatalogAddButton extends React.Component<CatalogAddButtonProps & Dependencies> {
  @observable protected isOpen = false;
  readonly menuItems = observable.map<CategoryId, CatalogEntityAddMenu[]>();

  constructor(props: CatalogAddButtonProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  componentDidMount() {
    this.updateMenuItems();
  }

  componentDidUpdate(prevProps: CatalogAddButtonProps) {
    if (prevProps.category != this.props.category) {
      this.updateMenuItems();
    }
  }

  get categories() {
    return this.props.categoryRegistry.filteredCategories.get();
  }

  @action
  updateMenuItems() {
    this.menuItems.clear();

    if (this.props.category) {
      this.updateCategoryItems(this.props.category);
    } else {
      // Show menu items from all categories
      this.categories.forEach(this.updateCategoryItems);
    }
  }

  updateCategoryItems = (category: CatalogCategory) => {
    this.props.onCatalogAddMenu(category, getOrInsert(this.menuItems, category.getId(), []));
  };

  getCategoryFilteredItems = (category: CatalogCategory) => (
    category.filteredItems(this.menuItems.get(category.getId()) || [])
  );

  @boundMethod
  onOpen() {
    this.isOpen = true;
  }

  @boundMethod
  onClose() {
    this.isOpen = false;
  }

  @boundMethod
  onButtonClick() {
    const defaultAction = this.items.find(item => item.defaultAction)?.onClick;
    const clickAction = defaultAction || (this.items.length === 1 ? this.items[0].onClick : null);

    clickAction?.();
  }

  get items() {
    const { category } = this.props;

    return category
      ? this.getCategoryFilteredItems(category)
      : this.categories.map(this.getCategoryFilteredItems).flat();
  }

  render() {
    if (this.items.length === 0) {
      return null;
    }

    return (
      <SpeedDial
        className="CatalogAddButton"
        ariaLabel="SpeedDial CatalogAddButton"
        open={this.isOpen}
        onOpen={this.onOpen}
        onClose={this.onClose}
        icon={<Icon material="add" />}
        direction="up"
        onClick={this.onButtonClick}
      >
        {this.items.map((menuItem, index) => (
          <SpeedDialAction
            key={index}
            icon={<Icon material={menuItem.icon}/>}
            tooltipTitle={menuItem.title}
            onClick={(evt) => {
              evt.stopPropagation();
              menuItem.onClick();
            }}
            TooltipClasses={{
              popper: "catalogSpeedDialPopper",
            }}
          />
        ))}
      </SpeedDial>
    );
  }
}

export const CatalogAddButton = withInjectables<Dependencies, CatalogAddButtonProps>(NonInjectedCatalogAddButton, {
  getProps: (di, props) => ({
    ...props,
    onCatalogAddMenu: di.inject(onCatalogAddMenuInjectable),
    categoryRegistry: di.inject(catalogCategoryRegistryInjectable),
  }),
});
