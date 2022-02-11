/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./list.scss";
import React from "react";
import { observer } from "mobx-react";
import { Badge } from "../../badge";
import { cssNames } from "../../../utils";
import type { Filter, PageFiltersStore } from "./store";
import { FilterIcon } from "../filter-icon";
import { Icon } from "../../icon";
import type { PageParam } from "../../../navigation/page-param";
import { withInjectables } from "@ogre-tools/injectable-react";
import pageFiltersStoreInjectable from "./store.injectable";
import searchUrlParamInjectable from "../../input/search-param.injectable";

export interface PageFiltersListProps {
  filters?: Filter[];
}

interface Dependencies {
  pageFiltersStore: PageFiltersStore;
  searchUrlParam: PageParam<string>;
}

const NonInjectedPageFiltersList = observer(({
  pageFiltersStore,
  searchUrlParam,
  filters = pageFiltersStore.activeFilters,
}: Dependencies & PageFiltersListProps) => {
  if (filters.length === 0) {
    return null;
  }

  const withRemove = (filter: Filter) => Object.assign(
    filter,
    {
      remove: () => {
        pageFiltersStore.removeFilter(filter);
        searchUrlParam.clear();
      },
    },
  );

  return (
    <div className="PageFiltersList">
      <div className="header flex gaps">
        <span>Currently applied filters:</span>
        <a
          onClick={() => pageFiltersStore.reset()}
          className="reset"
        >
          Reset
        </a>
      </div>
      <div className="labels">
        {
          filters
            .map(withRemove)
            .map(({ value, type, remove }) => (
              <Badge
                key={`${type}-${value}`}
                title={type}
                className={cssNames("Badge flex gaps filter align-center", type)}
                label={(
                  <>
                    <FilterIcon type={type}/>
                    <span className="value">{value}</span>
                    <Icon
                      small
                      material="close"
                      onClick={remove}
                    />
                  </>
                )}
              />
            ))
        }
      </div>
    </div>
  );
});

export const PageFiltersList = withInjectables<Dependencies, PageFiltersListProps>(NonInjectedPageFiltersList, {
  getProps: (di, props) => ({
    ...props,
    pageFiltersStore: di.inject(pageFiltersStoreInjectable),
    searchUrlParam: di.inject(searchUrlParamInjectable),
  }),
});
