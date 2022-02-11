/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import styles from "./catalog.module.scss";

import React from "react";
import { disposeOnUnmount, observer } from "mobx-react";
import { ItemListLayout } from "../item-object-list";
import type { IComputedValue } from "mobx";
import { action, makeObservable, observable, reaction, runInAction, when } from "mobx";
import type { CatalogEntityStore } from "./catalog-entity-store/catalog-entity.store";
import { MenuItem, MenuActions } from "../menu";
import { CatalogAddButton } from "./catalog-add-button";
import type { RouteComponentProps } from "react-router";
import { MainLayout } from "../layout/main-layout";
import { prevDefault } from "../../utils";
import { CatalogEntityDetails } from "./catalog-entity-details";
import type { CatalogViewRouteParam } from "../../../common/routes";
import { browseCatalogTab, catalogURL } from "../../../common/routes";
import { CatalogMenu } from "./catalog-menu";
import { RenderDelay } from "../render-delay/render-delay";
import { Icon } from "../icon";
import { HotbarToggleMenuItem } from "./hotbar-toggle-menu-item";
import { Avatar } from "../avatar";
import { withInjectables } from "@ogre-tools/injectable-react";
import catalogPreviousActiveTabStorageInjectable from "./catalog-previous-active-tab-storage/catalog-previous-active-tab-storage.injectable";
import catalogEntityStoreInjectable from "./catalog-entity-store/catalog-entity-store.injectable";
import type { GetCategoryColumnsParams, CategoryColumns } from "./category-columns/get.injectable";
import getCategoryColumnsInjectable from "./category-columns/get.injectable";
import type { RegisteredCustomCategoryViewDecl } from "./custom-views.injectable";
import customCategoryViewsInjectable from "./custom-views.injectable";
import type { CustomCategoryViewComponents } from "./custom-views";
import type { CatalogEntity, CatalogEntityContextMenu } from "../../../common/catalog/entity";
import type { CatalogCategoryRegistry } from "../../catalog/category/registry";
import catalogCategoryRegistryInjectable from "../../catalog/category/registry.injectable";
import type { OnContextMenuOpen } from "../../catalog/category/on-context-menu-open.injectable";
import onContextMenuOpenInjectable from "../../catalog/category/on-context-menu-open.injectable";
import type { ErrorNotification } from "../notifications/error.injectable";
import type { Hotbar } from "../../../common/hotbars/hotbar";
import errorNotificationInjectable from "../notifications/error.injectable";
import activeHotbarInjectable from "../../../common/hotbars/active-hotbar.injectable";
import type { Navigate } from "../../navigation/navigate.injectable";
import navigateInjectable from "../../navigation/navigate.injectable";
import { ContextMenu } from "../menu/context";

export interface CatalogProps extends RouteComponentProps<CatalogViewRouteParam> {}

interface Dependencies {
  catalogPreviousActiveTabStorage: { set: (value: string ) => void };
  catalogEntityStore: CatalogEntityStore;
  getCategoryColumns: (params: GetCategoryColumnsParams) => CategoryColumns;
  customCategoryViews: IComputedValue<Map<string, Map<string, RegisteredCustomCategoryViewDecl>>>;
  categoryRegistry: CatalogCategoryRegistry;
  onContextMenuOpen: OnContextMenuOpen;
  errorNotification: ErrorNotification;
  activeHotbar: IComputedValue<Hotbar>;
  navigate: Navigate;
}

@observer
class NonInjectedCatalog extends React.Component<CatalogProps & Dependencies> {
  private readonly menuItems = observable.array<CatalogEntityContextMenu>();
  @observable activeTab?: string;

  constructor(props: CatalogProps & Dependencies) {
    super(props);
    makeObservable(this);
  }

  get routeActiveTab(): string {
    const { group, kind } = this.props.match.params ?? {};

    if (group && kind) {
      return `${group}/${kind}`;
    }

    return browseCatalogTab;
  }

  get filteredCategories() {
    return this.props.categoryRegistry.filteredCategories.get();
  }

  get categories() {
    return this.props.categoryRegistry.categories.get();
  }

  async componentDidMount() {
    disposeOnUnmount(this, [
      this.props.catalogEntityStore.watch(),
      reaction(() => this.routeActiveTab, async (routeTab) => {
        this.props.catalogPreviousActiveTabStorage.set(this.routeActiveTab);

        try {
          await when(() => (routeTab === browseCatalogTab || !!this.filteredCategories.find(i => i.getId() === routeTab)), { timeout: 5_000 }); // we need to wait because extensions might take a while to load
          const item = this.filteredCategories.find(i => i.getId() === routeTab);

          runInAction(() => {
            this.activeTab = routeTab;
            this.props.catalogEntityStore.activeCategory = item;
          });
        } catch (error) {
          console.error(error);
          this.props.errorNotification(<p>Unknown category: {routeTab}</p>);
        }
      }, { fireImmediately: true }),
    ]);

    // If active category is filtered out, automatically switch to the first category
    disposeOnUnmount(this, reaction(() => this.filteredCategories, () => {
      if (!this.filteredCategories.find(item => item.getId() === this.props.catalogEntityStore.activeCategory.getId())) {
        const item = this.filteredCategories[0];

        runInAction(() => {
          if (item) {
            this.activeTab = item.getId();
            this.props.catalogEntityStore.activeCategory = item;
          }
        });
      }
    }));
  }

  addToHotbar(entity: CatalogEntity): void {
    this.props.activeHotbar.get().add(entity);
  }

  removeFromHotbar(entity: CatalogEntity): void {
    this.props.activeHotbar.get().remove(entity.getId());
  }

  onDetails = (entity: CatalogEntity) => {
    if (this.props.catalogEntityStore.selectedItemId) {
      this.props.catalogEntityStore.selectedItemId = null;
    } else {
      this.props.catalogEntityStore.onRun(entity);
    }
  };

  onTabChange = action((tabId: string | null) => {
    const activeCategory = this.categories.find(category => category.getId() === tabId);

    if (activeCategory) {
      this.props.navigate(catalogURL({ params: { group: activeCategory.spec.group, kind: activeCategory.spec.names.kind }}));
    } else {
      this.props.navigate(catalogURL({ params: { group: browseCatalogTab }}));
    }
  });

  renderItemMenu = (entity: CatalogEntity) => (
    <MenuActions
      onOpen={() => {
        this.menuItems.clear();
        this.props.onContextMenuOpen(entity, this.menuItems);
      }}
    >
      <MenuItem key="open-details" onClick={() => this.props.catalogEntityStore.selectedItemId = entity.getId()}>
        View Details
      </MenuItem>
      <ContextMenu menuItems={this.menuItems} />
      <HotbarToggleMenuItem
        key="hotbar-toggle"
        entity={entity}
        addContent="Add to Hotbar"
        removeContent="Remove from Hotbar" />
    </MenuActions>
  );

  renderName(entity: CatalogEntity) {
    const isItemInHotbar = this.props.activeHotbar.get().has(entity);

    return (
      <>
        <Avatar
          title={entity.getName()}
          colorHash={`${entity.getName()}-${entity.getSource()}`}
          src={entity.spec.icon?.src}
          background={entity.spec.icon?.background}
          className={styles.catalogAvatar}
          size={24}
        >
          {entity.spec.icon?.material && <Icon material={entity.spec.icon?.material} small/>}
        </Avatar>
        <span>{entity.getName()}</span>
        <Icon
          small
          className={styles.pinIcon}
          svg={isItemInHotbar ? "push_off" : "push_pin"}
          tooltip={isItemInHotbar ? "Remove from Hotbar" : "Add to Hotbar"}
          onClick={prevDefault(() => isItemInHotbar ? this.removeFromHotbar(entity) : this.addToHotbar(entity))}
        />
      </>
    );
  }

  renderViews = () => {
    const { catalogEntityStore, customCategoryViews } = this.props;
    const { activeCategory } = catalogEntityStore;

    if (!activeCategory) {
      return this.renderList();
    }

    const customViews = customCategoryViews.get()
      .get(activeCategory.spec.group)
      ?.get(activeCategory.spec.names.kind);
    const renderView = ({ View }: CustomCategoryViewComponents, index: number) => (
      <View
        key={index}
        category={activeCategory}
      />
    );

    return (
      <>
        {customViews?.before.map(renderView)}
        {this.renderList()}
        {customViews?.after.map(renderView)}
      </>
    );
  };

  renderList() {
    const { catalogEntityStore, getCategoryColumns } = this.props;
    const { activeCategory } = catalogEntityStore;
    const tableId = activeCategory
      ? `catalog-items-${activeCategory.metadata.name.replace(" ", "")}`
      : "catalog-items";

    if (this.activeTab === undefined) {
      return null;
    }

    return (
      <ItemListLayout
        className={styles.Catalog}
        tableId={tableId}
        renderHeaderTitle={activeCategory?.metadata.name ?? "Browse All"}
        isSelectable={false}
        isConfigurable={true}
        store={catalogEntityStore}
        getItems={() => catalogEntityStore.entities}
        customizeTableRowProps={entity => ({
          disabled: !entity.isEnabled(),
        })}
        {...getCategoryColumns({ activeCategory })}
        onDetails={this.onDetails}
        renderItemMenu={this.renderItemMenu}
      />
    );
  }

  render() {
    if (!this.props.catalogEntityStore) {
      return null;
    }

    const selectedEntity = this.props.catalogEntityStore.selectedItem;

    return (
      <MainLayout
        sidebar={
          <CatalogMenu
            activeItem={this.activeTab}
            onItemClick={this.onTabChange}
          />
        }
      >
        <div className={styles.views}>
          {this.renderViews()}
        </div>
        {
          selectedEntity
            ? <CatalogEntityDetails
              entity={selectedEntity}
              hideDetails={() => this.props.catalogEntityStore.selectedItemId = null}
              onRun={() => this.props.catalogEntityStore.onRun(selectedEntity)}
            />
            : (
              <RenderDelay>
                <CatalogAddButton
                  category={this.props.catalogEntityStore.activeCategory}
                />
              </RenderDelay>
            )
        }
      </MainLayout>
    );
  }
}

export const Catalog = withInjectables<Dependencies, CatalogProps>( NonInjectedCatalog, {
  getProps: (di, props) => ({
    ...props,
    catalogEntityStore: di.inject(catalogEntityStoreInjectable),
    catalogPreviousActiveTabStorage: di.inject(catalogPreviousActiveTabStorageInjectable),
    getCategoryColumns: di.inject(getCategoryColumnsInjectable),
    customCategoryViews: di.inject(customCategoryViewsInjectable),
    categoryRegistry: di.inject(catalogCategoryRegistryInjectable),
    onContextMenuOpen: di.inject(onContextMenuOpenInjectable),
    errorNotification: di.inject(errorNotificationInjectable),
    activeHotbar: di.inject(activeHotbarInjectable),
    navigate: di.inject(navigateInjectable),
  }),
});
