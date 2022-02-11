/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable } from "@ogre-tools/injectable";
import { orderBy } from "lodash";
import type { IComputedValue } from "mobx";
import type { CatalogCategory } from "../../../../common/catalog/category";
import type { CatalogEntity } from "../../../../common/catalog/entity";
import type { ItemListLayoutProps } from "../../item-object-list";
import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";
import categoryColumnsInjectable from "../custom-category-columns.injectable";
import defaultCategoryColumnsInjectable from "./default-columnns.injectable";
import browseAllColumns from "./browse-all-columns";
import nameCategoryColumnInjectable from "./name-column.injectable";

type ExtensionColumns = IComputedValue<Map<string, Map<string, RegisteredAdditionalCategoryColumn[]>>>;

interface Dependencies {
  extensionColumns: ExtensionColumns;
  nameCategoryColumn: RegisteredAdditionalCategoryColumn;
  defaultCategoryColumns: RegisteredAdditionalCategoryColumn[];
}

export interface GetCategoryColumnsParams {
  activeCategory: CatalogCategory | null | undefined;
}

export type CategoryColumns = Required<Pick<ItemListLayoutProps<CatalogEntity>, "sortingCallbacks" | "searchFilters" | "renderTableContents" | "renderTableHeader">>;
export type CetCategoryColumns = (params: GetCategoryColumnsParams) => CategoryColumns;

const getCategoryColumns = ({
  extensionColumns,
  nameCategoryColumn,
  defaultCategoryColumns,
}: Dependencies): CetCategoryColumns => {
  const getSpecificCategoryColumns = (activeCategory: CatalogCategory, extensionColumns: ExtensionColumns): RegisteredAdditionalCategoryColumn[] => {
    const fromExtensions = (
      extensionColumns
        .get()
        .get(activeCategory.spec.group)
        ?.get(activeCategory.spec.names.kind)
      ?? []
    );
    const fromCategory = activeCategory.spec.displayColumns?.map(({ priority = 50, ...column }) => ({
      priority,
      ...column,
    })) ?? defaultCategoryColumns;

    return [
      nameCategoryColumn,
      ...fromExtensions,
      ...fromCategory,
    ];
  };

  return ({ activeCategory }) => {
    const allRegistrations = orderBy(
      activeCategory
        ? getSpecificCategoryColumns(activeCategory, extensionColumns)
        : [
          ...browseAllColumns,
          nameCategoryColumn,
          ...defaultCategoryColumns,
        ],
      "priority",
      "asc",
    );

    const sortingCallbacks: CategoryColumns["sortingCallbacks"] = {};
    const searchFilters: CategoryColumns["searchFilters"] = [];
    const renderTableHeader: CategoryColumns["renderTableHeader"] = [];
    const tableRowRenderers: ((entity: CatalogEntity) => React.ReactNode)[] = [];

    for (const registration of allRegistrations) {
      if (registration.sortCallback) {
        sortingCallbacks[registration.id] = registration.sortCallback;
      }

      if (registration.searchFilter) {
        searchFilters.push(registration.searchFilter);
      }

      tableRowRenderers.push(registration.renderCell);
      renderTableHeader.push(registration.titleProps);
    }

    return {
      sortingCallbacks,
      renderTableHeader,
      renderTableContents: entity => tableRowRenderers.map(fn => fn(entity)),
      searchFilters,
    };
  };
};

const getCategoryColumnsInjectable = getInjectable({
  instantiate: (di) => getCategoryColumns({
    extensionColumns: di.inject(categoryColumnsInjectable),
    nameCategoryColumn: di.inject(nameCategoryColumnInjectable),
    defaultCategoryColumns: di.inject(defaultCategoryColumnsInjectable),
  }),
  id: "get-category-columns",
});

export default getCategoryColumnsInjectable;
