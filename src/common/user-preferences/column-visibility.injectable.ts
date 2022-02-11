/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */
import { getInjectable, lifecycleEnum } from "@ogre-tools/injectable";
import { action } from "mobx";
import { getOrInsertSet, toggle } from "../utils";
import { userPreferencesStoreInjectionToken } from "./store-injection-token";

export interface ColumnVisibility {
  isHidden: (columnId: string, showWithColumnId?: string) => boolean;
  toggleIsHidden: (columnId: string) => void;
}

interface TableColumnVisibilityParams {
  tableId: string;
}

const tableColumnVisibilityInjectable = getInjectable({
  instantiate: (di, { tableId }: TableColumnVisibilityParams): ColumnVisibility => {
    const store = di.inject(userPreferencesStoreInjectionToken);

    return {
      isHidden: (columnId, showWithColumnId) => {
        const config = store.hiddenTableColumns.get(tableId);

        if (!config) {
          return false;
        }

        return config.has(columnId) || config.has(showWithColumnId);
      },
      toggleIsHidden: action((columnId) => {
        toggle(getOrInsertSet(store.hiddenTableColumns, tableId), columnId);
      }),
    };
  },
  lifecycle: lifecycleEnum.transient,
  id: "column-visibility",
});

export default tableColumnVisibilityInjectable;

