/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React, { useCallback, useState } from "react";
import debounce from "lodash/debounce";
import { observer } from "mobx-react";
import type { InputProps } from "./input";
import { SearchInput } from "./search-input";
import type { PageParam } from "../../navigation/page-param";
import { withInjectables } from "@ogre-tools/injectable-react";
import searchUrlParamInjectable from "./search-param.injectable";
import { noop } from "../../utils";
export interface SearchInputUrlProps extends InputProps {
  compact?: boolean; // show only search-icon when not focused
}

interface Dependencies {
  searchUrlParam: PageParam<string>;
}

const NonInjectedSearchInputUrl = observer(({
  searchUrlParam,
  onChange = noop,
  ...searchInputProps
}: Dependencies & SearchInputUrlProps) => {
  const [inputValue, setInputValue] = useState("");
  const updateUrl = useCallback(
    debounce((value: string) => searchUrlParam.set(value), 250),
    [searchUrlParam],
  );

  return (
    <SearchInput
      value={inputValue}
      onChange={(value, event) => {
        setInputValue(value);
        updateUrl(value);
        onChange(value, event);
      }}
      onClear={() => {
        setInputValue("");
        updateUrl("");
        updateUrl.flush();
      }}
      {...searchInputProps}
    />
  );
});

export const SearchInputUrl = withInjectables<Dependencies, SearchInputUrlProps>(NonInjectedSearchInputUrl, {
  getProps: (di, props) => ({
    ...props,
    searchUrlParam: di.inject(searchUrlParamInjectable),
  }),
});
