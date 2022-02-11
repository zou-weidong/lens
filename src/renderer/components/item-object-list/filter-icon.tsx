/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import React from "react";
import type { BaseIconProps } from "../icon";
import { Icon } from "../icon";
import { FilterType } from "./page-filters/store";

export interface FilterIconProps extends BaseIconProps {
  type: FilterType;
}

export function FilterIcon({ type, ...iconProps }: FilterIconProps) {
  switch (type) {
    case FilterType.SEARCH:
      return <Icon small material="search" {...iconProps}/>;
    default:
      return <Icon small material="filter_list" {...iconProps}/>;
  }
}
