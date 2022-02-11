/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import type { RegisteredAdditionalCategoryColumn } from "../custom-category-columns";

const browseAllColumns: RegisteredAdditionalCategoryColumn[] = [
  {
    id: "kind",
    priority: 5,
    renderCell: entity => entity.kind,
    titleProps: {
      id: "kind",
      sortBy: "kind",
      title: "Kind",
    },
    sortCallback: entity => entity.kind,
  },
];

export default browseAllColumns;
